"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

// ---------------------------------------------------------------------------
// Document configuration (shared with module-level actions)
// ---------------------------------------------------------------------------

const DOCUMENT_TYPES = [
  "photo",
  "cv",
  "video",
  "civilFront",
  "civilBack",
] as const;

type DocumentType = (typeof DOCUMENT_TYPES)[number];

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  photo: "Personal Photo",
  cv: "CV / Resume",
  video: "Video Profile",
  civilFront: "Civil ID (Front)",
  civilBack: "Civil ID (Back)",
};

const DOCUMENT_FIELD_MAP: Record<DocumentType, string> = {
  photo: "candidate_personal_photo",
  cv: "candidate_resume",
  video: "candidate_video",
  civilFront: "candidate_civil_photo_front",
  civilBack: "candidate_civil_photo_back",
};

type CandidateDocumentItem = {
  type: DocumentType;
  label: string;
  filePath: string | null;
  fileUrl: string | null;
  field: string;
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "candidates");

// ---------------------------------------------------------------------------
// listMyDocuments — list all document types with current file status
// ---------------------------------------------------------------------------

export type ListDocumentsResult = {
  items: CandidateDocumentItem[];
};

/**
 * List all document types and their current file status for the signed-in candidate.
 */
export async function listMyDocuments(): Promise<ListDocumentsResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: {
      candidate_personal_photo: true,
      candidate_resume: true,
      candidate_video: true,
      candidate_civil_photo_front: true,
      candidate_civil_photo_back: true,
    },
  });

  if (!candidate) {
    return { items: [] };
  }

  const items: CandidateDocumentItem[] = DOCUMENT_TYPES.map((type) => {
    const field = DOCUMENT_FIELD_MAP[type];
    const filePath = (candidate as Record<string, unknown>)[field] as string | null;
    return {
      type,
      label: DOCUMENT_LABELS[type],
      filePath,
      fileUrl: filePath,
      field,
    };
  });

  return { items };
}

// ---------------------------------------------------------------------------
// getDocumentDetail — get a single document's info for the detail page
// ---------------------------------------------------------------------------

export type DocumentDetailResult = {
  type: string;
  label: string;
  filePath: string | null;
  fileUrl: string | null;
  field: string;
};

/**
 * Get a single document type's detail for the signed-in candidate.
 * Returns null if the candidate does not exist.
 */
export async function getDocumentDetail(
  documentType: string,
): Promise<DocumentDetailResult | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  if (!DOCUMENT_TYPES.includes(documentType as DocumentType)) {
    return null;
  }

  const field = DOCUMENT_FIELD_MAP[documentType as DocumentType];
  const label = DOCUMENT_LABELS[documentType as DocumentType];

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: { [field]: true },
  });

  if (!candidate) return null;

  const filePath = (candidate as Record<string, unknown>)[field] as string | null;

  return {
    type: documentType,
    label,
    filePath,
    fileUrl: filePath,
    field,
  };
}

// ---------------------------------------------------------------------------
// Upload configuration
// ---------------------------------------------------------------------------

const ALLOWED_TYPES: Record<string, { mime: string[]; ext: string[]; maxSize: number }> = {
  photo: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
  cv: {
    mime: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ext: [".pdf", ".doc", ".docx"],
    maxSize: 10 * 1024 * 1024,
  },
  video: {
    mime: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    ext: [".mp4", ".webm", ".ogv", ".mov"],
    maxSize: 50 * 1024 * 1024,
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
// uploadCandidateDocument — form action for uploading a document
// ---------------------------------------------------------------------------

export type UploadDocumentState = {
  success: boolean;
  error?: string;
  filePath?: string;
};

/**
 * Upload a document for the current candidate.
 * Accepts FormData with file_{type} field matching the document type.
 */
export async function uploadCandidateDocument(
  _prevState: UploadDocumentState,
  formData: FormData,
): Promise<UploadDocumentState> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

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
    return { success: false, error: `Invalid file type "${file.type}" for ${documentType}.` };
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
    revalidatePath("/candidate/documents");

    return { success: true, filePath: publicPath };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Upload failed due to an unknown error.",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteCandidateDocument — form action for deleting a document
// ---------------------------------------------------------------------------

export type DeleteDocumentState = {
  success: boolean;
  error?: string;
};

/**
 * Delete a candidate's document by type.
 * Uses session to derive candidate ID (self-service).
 */
export async function deleteCandidateDocument(
  _prevState: DeleteDocumentState,
  formData: FormData,
): Promise<DeleteDocumentState> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const rawType = formData.get("documentType");
  if (!rawType || typeof rawType !== "string" || rawType.trim().length === 0) {
    return { success: false, error: "documentType is required." };
  }

  const trimmedType = rawType.trim() as DocumentType;
  if (!DOCUMENT_TYPES.includes(trimmedType)) {
    return {
      success: false,
      error: `Invalid document type "${trimmedType}". Must be one of: ${DOCUMENT_TYPES.join(", ")}.`,
    };
  }

  const field = DOCUMENT_FIELD_MAP[trimmedType];

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
    revalidatePath("/candidate/documents");

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Delete failed due to an unknown error.",
    };
  }
}
