"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { DOCUMENT_TYPES } from "./constants";
import type { DocumentType } from "./constants";
import {
  listDocumentsSchema,
  getDocumentSchema,
  uploadDocumentParamsSchema,
  deleteDocumentSchema,
  type CandidateDocumentItem,
  type ListCandidateDocumentsResult,
  type UploadDocumentState,
  type DeleteDocumentState,
  type ListDocumentsParams,
  type GetDocumentParams,
  type UploadDocumentParams,
  type DeleteDocumentParams,
} from "./schemas";

// ---------------------------------------------------------------------------
// Labels for each document type
// ---------------------------------------------------------------------------

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  photo: "Personal Photo",
  cv: "CV / Resume",
  video: "Video Profile",
  civilFront: "Civil ID (Front)",
  civilBack: "Civil ID (Back)",
};

/** Maps document type to the DB column on the candidate model. */
const DOCUMENT_FIELD_MAP: Record<DocumentType, string> = {
  photo: "candidate_personal_photo",
  cv: "candidate_resume",
  video: "candidate_video",
  civilFront: "candidate_civil_photo_front",
  civilBack: "candidate_civil_photo_back",
};

// Upload configuration
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "candidates");

const ALLOWED_TYPES: Record<string, { mime: string[]; ext: string[]; maxSize: number }> = {
  photo: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024, // 5 MB
  },
  cv: {
    mime: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ext: [".pdf", ".doc", ".docx"],
    maxSize: 10 * 1024 * 1024, // 10 MB
  },
  video: {
    mime: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    ext: [".mp4", ".webm", ".ogv", ".mov"],
    maxSize: 50 * 1024 * 1024, // 50 MB
  },
  civilFront: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
  civilBack: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a CandidateDocumentItem from type + raw file path from DB.
 */
function toDocumentItem(type: DocumentType, filePath: string | null): CandidateDocumentItem {
  return {
    type,
    label: DOCUMENT_LABELS[type],
    filePath,
    fileUrl: filePath ? filePath : null,
  };
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List all document types and their file paths for a candidate.
 * Requires candidate.read capability.
 * Returns an item for each known document type, with null filePath if not uploaded.
 */
export async function listCandidateDocuments(
  params: ListDocumentsParams,
): Promise<ListCandidateDocumentsResult> {
  await requireCapability("candidate.read");

  const { candidateId } = listDocumentsSchema.parse(params);

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: {
      candidate_id: true,
      candidate_personal_photo: true,
      candidate_resume: true,
      candidate_video: true,
      candidate_civil_photo_front: true,
      candidate_civil_photo_back: true,
    },
  });

  if (!candidate) {
    return { items: [], candidateId };
  }

  const items: CandidateDocumentItem[] = DOCUMENT_TYPES.map((type) => {
    const field = DOCUMENT_FIELD_MAP[type];
    const filePath = (candidate as Record<string, unknown>)[field] as string | null;
    return toDocumentItem(type, filePath);
  });

  return { items, candidateId: candidate.candidate_id };
}

/**
 * Get a single document by type for a candidate.
 * Requires candidate.read capability.
 * Returns null if the candidate does not exist or the document field is not set.
 */
export async function getCandidateDocument(
  params: GetDocumentParams,
): Promise<CandidateDocumentItem | null> {
  await requireCapability("candidate.read");

  const { candidateId, documentType } = getDocumentSchema.parse(params);

  const field = DOCUMENT_FIELD_MAP[documentType];

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: { [field]: true, candidate_id: false },
  });

  if (!candidate) return null;

  const filePath = (candidate as Record<string, unknown>)[field] as string | null;
  return toDocumentItem(documentType, filePath);
}

/**
 * Upload a document for a candidate.
 * Requires candidate.profile.edit capability.
 * Accepts FormData with file_{type} field matching the document type.
 * Returns UploadDocumentState for useActionState.
 */
export async function uploadCandidateDocument(
  _prevState: UploadDocumentState,
  formData: FormData,
): Promise<UploadDocumentState> {
  const session = await requireCapability("candidate.profile.edit");
  const candidateId = Number(session.id);

  // Parse document type from form data
  let documentType: DocumentType | null = null;
  let file: File | null = null;

  for (const dt of DOCUMENT_TYPES) {
    const f = formData.get(`file_${dt}`);
    if (f instanceof File && f.size > 0) {
      documentType = dt;
      file = f;
      break;
    }
  }

  if (!documentType || !file || file.size === 0) {
    return { success: false, error: "No file provided. Use file_{type} field (e.g. file_photo)." };
  }

  const parseResult = uploadDocumentParamsSchema.safeParse({ candidateId, documentType });
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.errors.map((e) => e.message).join("; ") };
  }

  const typeConfig = ALLOWED_TYPES[documentType];

  // Validate file extension
  const ext = path.extname(file.name).toLowerCase();
  if (!typeConfig.ext.includes(ext)) {
    return {
      success: false,
      error: `File type "${ext}" is not allowed for ${documentType}. Accepted: ${typeConfig.ext.join(", ")}.`,
    };
  }

  // Validate MIME type
  if (file.type && !typeConfig.mime.includes(file.type)) {
    return { success: false, error: `Invalid MIME type "${file.type}" for ${documentType}.` };
  }

  // Validate size
  if (file.size > typeConfig.maxSize) {
    const sizeMB = typeConfig.maxSize / 1024 / 1024;
    return {
      success: false,
      error: `File is too large. Maximum size for ${documentType} is ${sizeMB} MB.`,
    };
  }

  try {
    // Save file to disk
    const dir = path.join(UPLOAD_DIR, String(candidateId));
    await fs.mkdir(dir, { recursive: true });

    const filename = `${documentType}_${crypto.randomUUID()}${ext}`;
    const filepath = path.join(dir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    const publicPath = `/uploads/candidates/${candidateId}/${filename}`;

    // Update the correct DB field
    const field = DOCUMENT_FIELD_MAP[documentType];
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { [field]: publicPath },
    });

    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");

    return { success: true, filePath: publicPath };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Upload failed due to an unknown error.",
    };
  }
}

// ---------------------------------------------------------------------------
// Delete document
// ---------------------------------------------------------------------------

/**
 * Delete a candidate's document by type.
 * Requires candidate.profile.edit capability.
 * Derives candidateId from the session (self-service).
 * Clears the DB field and removes the file from disk if it exists.
 * Returns DeleteDocumentState for useActionState.
 */
export async function deleteCandidateDocument(
  _prevState: DeleteDocumentState,
  formData: FormData,
): Promise<DeleteDocumentState> {
  const session = await requireCapability("candidate.profile.edit");
  const candidateId = Number(session.id);

  const rawType = formData.get("documentType");
  if (!rawType || typeof rawType !== "string" || rawType.trim().length === 0) {
    return { success: false, error: "documentType is required." };
  }

  const parseResult = deleteDocumentSchema.safeParse({ documentType: rawType.trim() });
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.errors.map((e) => e.message).join("; ") };
  }

  const { documentType } = parseResult.data;
  const field = DOCUMENT_FIELD_MAP[documentType];

  try {
    // Get current file path before clearing
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: { [field]: true },
    });

    if (!candidate) {
      return { success: false, error: "Candidate not found." };
    }

    const currentPath = (candidate as Record<string, unknown>)[field] as string | null;

    // Clear the DB field
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { [field]: null },
    });

    // Delete the file from disk if it exists and is a local file
    if (currentPath && currentPath.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", currentPath);
      try {
        await fs.unlink(filePath);
      } catch {
        // File may already be gone — that's fine
      }
    }

    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Delete failed due to an unknown error.",
    };
  }
}
