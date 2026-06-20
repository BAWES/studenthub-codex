"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  uploadToS3,
  deleteFromS3,
  getS3DownloadUrl,
  isS3Path,
  toS3Key,
  toS3StoredPath,
  s3ConfigAvailable,
} from "@/lib/s3";
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
// Helpers
// ---------------------------------------------------------------------------

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

export async function listCandidateDocuments(
  params: ListDocumentsParams,
): Promise<ListCandidateDocumentsResult> {
  await requireCapability("candidate.read.own");

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

    const outputParsed = listCandidateDocumentsResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] listCandidateDocuments output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const items: CandidateDocumentItem[] = DOCUMENT_TYPES.map((type) => {
    const field = DOCUMENT_FIELD_MAP[type];
    const filePath = (candidate as Record<string, unknown>)[field] as string | null;
    return toDocumentItem(type, filePath);
  });

  const result: ListCandidateDocumentsResult = { items, candidateId: candidate.candidate_id };

  const outputParsed = listCandidateDocumentsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/documents] listCandidateDocuments output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function getCandidateDocument(
  params: GetDocumentParams,
): Promise<CandidateDocumentItem | null> {
  await requireCapability("candidate.read.own");

  const { candidateId, documentType } = getDocumentSchema.parse(params);

  const field = DOCUMENT_FIELD_MAP[documentType];

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: { [field]: true, candidate_id: false },
  });

  if (!candidate) {
    const result: CandidateDocumentItem | null = null;

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
  const result: CandidateDocumentItem = toDocumentItem(documentType, filePath);

  const outputParsed = getCandidateDocumentResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/documents] getCandidateDocument output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function uploadCandidateDocument(
  _prevState: UploadDocumentState,
  formData: FormData,
): Promise<UploadDocumentState> {
  const session = await requireCapability("candidate.profile.edit");
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
    const result: UploadDocumentState = {
      success: false,
      error: "No file provided. Use file_{type} field (e.g. file_photo).",
    };

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

  const ext = path.extname(file.name).toLowerCase();
  if (!typeConfig.ext.includes(ext)) {
    const result: UploadDocumentState = {
      success: false,
      error: `File type "${ext}" is not allowed for ${documentType}. Accepted: ${typeConfig.ext.join(", ")}.`,
    };

    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  if (file.type && !typeConfig.mime.includes(file.type)) {
    const result: UploadDocumentState = {
      success: false,
      error: `Invalid MIME type "${file.type}" for ${documentType}.`,
    };

    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  if (file.size > typeConfig.maxSize) {
    const sizeMB = typeConfig.maxSize / 1024 / 1024;
    const result: UploadDocumentState = {
      success: false,
      error: `File is too large. Maximum size for ${documentType} is ${sizeMB} MB.`,
    };

    const outputParsed = uploadDocumentStateResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidates/documents] uploadCandidateDocument output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const useS3 = s3ConfigAvailable();

  try {
    // Determine storage path
    const ext = path.extname(file.name).toLowerCase();
    const filename = `${documentType}_${crypto.randomUUID()}${ext}`;
    const relativeDir = path.join("uploads", "candidates", String(candidateId));
    const relativePath = path.join(relativeDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    let storedPath: string;

    if (s3ConfigAvailable()) {
      // Upload to S3/MinIO
      await uploadToS3(relativePath, buffer, file.type || undefined);
      storedPath = toS3StoredPath(relativePath);
    } else {
      // Fallback: save to local disk
      const fullDir = path.join(process.cwd(), "public", relativeDir);
      await fs.mkdir(fullDir, { recursive: true });
      await fs.writeFile(path.join(fullDir, filename), buffer);
      storedPath = `/uploads/candidates/${candidateId}/${filename}`;
    }

    const field = DOCUMENT_FIELD_MAP[documentType];
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { [field]: storedPath },
    });

    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");

    const result: UploadDocumentState = { success: true, filePath: storedPath };

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
// URL resolver
// ---------------------------------------------------------------------------

/**
 * Resolve the display/download URL for a candidate document.
 * For S3-stored files, generates a presigned URL.
 * For local files, returns the public path as-is.
 * Returns null if the path is empty.
 */
export async function getCandidateDocumentUrl(
  filePath: string | null,
): Promise<string | null> {
  if (!filePath) return null;

  if (isS3Path(filePath)) {
    return getS3DownloadUrl(toS3Key(filePath));
  }

  // Local file — serve directly from public/
  return filePath;
}

// ---------------------------------------------------------------------------
// Delete document
// ---------------------------------------------------------------------------

export async function deleteCandidateDocument(
  _prevState: DeleteDocumentState,
  formData: FormData,
): Promise<DeleteDocumentState> {
  const session = await requireCapability("candidate.profile.edit");
  const candidateId = Number(session.id);

  const rawType = formData.get("documentType");
  if (!rawType || typeof rawType !== "string" || rawType.trim().length === 0) {
    const result: DeleteDocumentState = { success: false, error: "documentType is required." };

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
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: { [field]: true },
    });

    if (!candidate) {
      const result: DeleteDocumentState = { success: false, error: "Candidate not found." };

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

    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { [field]: null },
    });

    // Delete the file from disk or S3
    if (currentPath) {
      if (isS3Path(currentPath)) {
        // Delete from S3/MinIO (best-effort)
        try {
          await deleteFromS3(toS3Key(currentPath));
        } catch {
          // Object may already be gone
        }
      } else if (currentPath.startsWith("/uploads/")) {
        // Delete from local disk
        const filePath = path.join(process.cwd(), "public", currentPath);
        try {
          await fs.unlink(filePath);
        } catch {
          // File may already be gone — that's fine
        }
      }
    }

    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");

    const result: DeleteDocumentState = { success: true };

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

// ---------------------------------------------------------------------------
// getCandidateDocumentDownloadUrl
// ---------------------------------------------------------------------------

export async function getCandidateDocumentDownloadUrl(
  params: GetDocumentParams,
): Promise<{ downloadUrl: string; key: string } | null> {
  await requireCapability("candidate.read.own");

  if (!s3ConfigAvailable()) {
    return null;
  }

  const { candidateId, documentType } = getDocumentSchema.parse(params);

  const field = DOCUMENT_FIELD_MAP[documentType];

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: { [field]: true },
  });

  if (!candidate) {
    return null;
  }

  const filePath = (candidate as Record<string, unknown>)[field] as string | null;

  if (!filePath || !isS3Path(filePath)) {
    return null;
  }

  try {
    const downloadUrl = await getS3DownloadUrl(toS3Key(filePath));
    if (!downloadUrl) return null;
    return { downloadUrl, key: filePath };
  } catch {
    return null;
  }
}
