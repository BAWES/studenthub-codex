"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "candidates");

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
// S3 client (lazy-initialized, supports MinIO via AWS_ENDPOINT_URL)
// ---------------------------------------------------------------------------

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const config: ConstructorParameters<typeof S3Client>[0] = {
      region: process.env.AWS_TEMP_BUCKET_REGION ?? "",
      credentials: {
        accessKeyId: process.env.AWS_TEMP_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_TEMP_SECRET_ACCESS_KEY ?? "",
      },
    };

    if (process.env.AWS_ENDPOINT_URL) {
      config.endpoint = process.env.AWS_ENDPOINT_URL;
    }

    if (process.env.AWS_S3_FORCE_PATH_STYLE === "true") {
      config.forcePathStyle = true;
    }

    s3Client = new S3Client(config);
  }
  return s3Client;
}

function s3ConfigAvailable(): boolean {
  return !!(
    process.env.AWS_TEMP_BUCKET_REGION &&
    process.env.AWS_TEMP_ACCESS_KEY_ID &&
    process.env.AWS_TEMP_SECRET_ACCESS_KEY &&
    process.env.AWS_TEMP_BUCKET_NAME
  );
}

function getBucketName(): string {
  return process.env.AWS_TEMP_BUCKET_NAME ?? "";
}

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

function isS3Key(filePath: string | null): boolean {
  return !!filePath && !filePath.startsWith("/");
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
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${documentType}_${crypto.randomUUID()}${ext}`;
    let publicPath: string;
    let s3Key: string | undefined;

    if (useS3) {
      const s3ObjectKey = `candidates/${candidateId}/${filename}`;
      const command = new PutObjectCommand({
        Bucket: getBucketName(),
        Key: s3ObjectKey,
        Body: buffer,
        ContentType: file.type || undefined,
      });
      await getS3Client().send(command);

      s3Key = s3ObjectKey;
      publicPath = s3ObjectKey;
    } else {
      const dir = path.join(UPLOAD_DIR, String(candidateId));
      await fs.mkdir(dir, { recursive: true });
      const filepath = path.join(dir, filename);
      await fs.writeFile(filepath, buffer);
      publicPath = `/uploads/candidates/${candidateId}/${filename}`;
    }

    const field = DOCUMENT_FIELD_MAP[documentType];
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { [field]: publicPath },
    });

    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");

    const result: UploadDocumentState = {
      success: true,
      filePath: publicPath,
      s3Key: s3Key,
    };

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

    if (currentPath && isS3Key(currentPath) && s3ConfigAvailable()) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: getBucketName(),
          Key: currentPath,
        });
        await getS3Client().send(deleteCommand);
      } catch {
        // Object may already be gone
      }
    } else if (currentPath && currentPath.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", currentPath);
      try {
        await fs.unlink(filePath);
      } catch {
        // File may already be gone
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

  if (!filePath || !isS3Key(filePath)) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: filePath,
  });

  try {
    const downloadUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: 900,
    });

    return {
      downloadUrl,
      key: filePath,
    };
  } catch {
    return null;
  }
}
