"use server";

import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  putS3Object,
  deleteS3Object,
  isS3Key,
  getPresignedDownloadUrl,
} from "@/modules/aws";
import { DOCUMENT_TYPES } from "./constants";
import type { DocumentType } from "./constants";
import {
  listDocumentsSchema,
  getDocumentSchema,
  uploadDocumentParamsSchema,
  deleteDocumentSchema,
  listCandidateDocumentsResultSchema,
  getCandidateDocumentResultSchema,
  uploadDocumentStateResultSchema,
  deleteDocumentStateResultSchema,
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
 * Build a CandidateDocumentItem from type + stored key/path from DB.
 * If the stored path is an S3 key (no leading "/"), generates a presigned
 * download URL for the fileUrl. Legacy local paths are returned as-is.
 */
async function toDocumentItem(type: DocumentType, filePath: string | null): Promise<CandidateDocumentItem> {
  let fileUrl: string | null = filePath;

  if (filePath && await isS3Key(filePath)) {
    // Generate a presigned download URL for S3-stored objects
    const result = await getPresignedDownloadUrl({ key: filePath });
    if (!("error" in result)) {
      fileUrl = result.downloadUrl;
    }
    // If presigned URL generation fails, fall back to the raw key
  } else if (filePath) {
    // Legacy local path — use as-is (served by Next.js from public/)
    fileUrl = filePath;
  }

  return {
    type,
    label: DOCUMENT_LABELS[type],
    filePath,
    fileUrl,
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
    const result: ListCandidateDocumentsResult = { items: [], candidateId };

    // Validate output shape
    const outputParsed = listCandidateDocumentsResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] listCandidateDocuments output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const items: CandidateDocumentItem[] = [];
  for (const type of DOCUMENT_TYPES) {
    const field = DOCUMENT_FIELD_MAP[type];
    const filePath = (candidate as Record<string, unknown>)[field] as string | null;
    items.push(await toDocumentItem(type, filePath));
  }

  const result: ListCandidateDocumentsResult = { items, candidateId: candidate.candidate_id };

  // Validate output shape
  const outputParsed = listCandidateDocumentsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/documents] listCandidateDocuments output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  if (!candidate) {
    const result: CandidateDocumentItem | null = null;

    // Validate output shape
    const outputParsed = getCandidateDocumentResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] getCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const filePath = (candidate as Record<string, unknown>)[field] as string | null;
  const result: CandidateDocumentItem = await toDocumentItem(documentType, filePath);

  // Validate output shape
  const outputParsed = getCandidateDocumentResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/documents] getCandidateDocument output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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
    const result: UploadDocumentState = {
      success: false,
      error: "No file provided. Use file_{type} field (e.g. file_photo).",
    };

    // Validate output shape
    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const parseResult = uploadDocumentParamsSchema.safeParse({ candidateId, documentType });
  if (!parseResult.success) {
    const result: UploadDocumentState = {
      success: false,
      error: parseResult.error.errors.map((e) => e.message).join("; "),
    };

    // Validate output shape
    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const typeConfig = ALLOWED_TYPES[documentType];

  // Validate file extension
  const ext = path.extname(file.name).toLowerCase();
  if (!typeConfig.ext.includes(ext)) {
    const result: UploadDocumentState = {
      success: false,
      error: `File type "${ext}" is not allowed for ${documentType}. Accepted: ${typeConfig.ext.join(", ")}.`,
    };

    // Validate output shape
    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  // Validate MIME type
  if (file.type && !typeConfig.mime.includes(file.type)) {
    const result: UploadDocumentState = {
      success: false,
      error: `Invalid MIME type "${file.type}" for ${documentType}.`,
    };

    // Validate output shape
    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  // Validate size
  if (file.size > typeConfig.maxSize) {
    const sizeMB = typeConfig.maxSize / 1024 / 1024;
    const result: UploadDocumentState = {
      success: false,
      error: `File is too large. Maximum size for ${documentType} is ${sizeMB} MB.`,
    };

    // Validate output shape
    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3/MinIO instead of local disk
    // The key pattern is: candidates/{candidateId}/{documentType}_{uuid}.ext
    const uuid = crypto.randomUUID();
    const s3Key = `candidates/${candidateId}/${documentType}_${uuid}${ext}`;

    const uploadResult = await putS3Object({
      key: s3Key,
      contentType: file.type || "application/octet-stream",
      buffer,
    });

    if (!uploadResult.success) {
      const result: UploadDocumentState = {
        success: false,
        error: uploadResult.error ?? "Failed to upload file to S3",
      };

      // Validate output shape
      const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
      if (!outputParsed.success) {
        console.error(
          "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
          outputParsed.error.issues,
        );
      }

      return result;
    }

    // Update the correct DB field with the S3 key
    const field = DOCUMENT_FIELD_MAP[documentType];
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { [field]: s3Key },
    });

    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");

    const result: UploadDocumentState = { success: true, filePath: s3Key };

    // Validate output shape
    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (e) {
    const result: UploadDocumentState = {
      success: false,
      error: e instanceof Error ? e.message : "Upload failed due to an unknown error.",
    };

    // Validate output shape
    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
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
    const result: DeleteDocumentState = { success: false, error: "documentType is required." };

    // Validate output shape
    const outputParsed = deleteDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] deleteCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const parseResult = deleteDocumentSchema.safeParse({ documentType: rawType.trim() });
  if (!parseResult.success) {
    const result: DeleteDocumentState = {
      success: false,
      error: parseResult.error.errors.map((e) => e.message).join("; "),
    };

    // Validate output shape
    const outputParsed = deleteDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] deleteCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
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
      const result: DeleteDocumentState = { success: false, error: "Candidate not found." };

      // Validate output shape
      const outputParsed = deleteDocumentStateResultSchema.safeParse(result);
      if (!outputParsed.success) {
        console.error(
          "[modules/candidates/documents] deleteCandidateDocument output validation failed:",
          outputParsed.error.issues,
        );
      }

      return result;
    }

    const currentPath = (candidate as Record<string, unknown>)[field] as string | null;

    // Clear the DB field
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { [field]: null },
    });

    // Delete from S3 if the stored path is an S3 key (no leading "/").
    // Legacy local paths (starting with "/uploads/") are cleaned from disk.
    if (currentPath && await isS3Key(currentPath)) {
      await deleteS3Object({ key: currentPath });
    } else if (currentPath && currentPath.startsWith("/uploads/")) {
      // Legacy cleanup: remove from local disk
      const filePath = path.join(process.cwd(), "public", currentPath);
      try {
        await fs.unlink(filePath);
      } catch {
        // File may already be gone — that's fine
      }
    }

    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");

    const result: DeleteDocumentState = { success: true };

    // Validate output shape
    const outputParsed = deleteDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] deleteCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (e) {
    const result: DeleteDocumentState = {
      success: false,
      error: e instanceof Error ? e.message : "Delete failed due to an unknown error.",
    };

    // Validate output shape
    const outputParsed = deleteDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] deleteCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}
