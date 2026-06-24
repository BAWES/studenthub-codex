"use server";

import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  listDocumentsSchema,
  getDocumentSchema,
  uploadDocumentSchema,
  listDocumentsResultSchema,
  documentDetailSchema,
  uploadDocumentResultSchema,
  type ListDocumentsInput,
  type UploadDocumentInput,
  type DocumentItem,
  type ListDocumentsResult,
  type UploadDocumentResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Upload directory config
// ---------------------------------------------------------------------------

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "documents");

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

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List documents with optional company_id filter and pagination.
 */
export async function listDocuments(
  params: ListDocumentsInput = {},
): Promise<ListDocumentsResult> {
  await requireCapability("document.read");

  const parsed = listDocumentsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { company_id, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};

  if (company_id !== undefined) {
    where.company_id = company_id;
  }

  const [documents, total] = await Promise.all([
    prisma.file.findMany({
      where: where as any,
      orderBy: { file_created_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.file.count({ where: where as any }),
  ]);

  const result = {
    documents: documents as DocumentItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listDocumentsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/documents] listDocuments output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single document by file_uuid.
 */
export async function getDocument(
  file_uuid: string,
): Promise<DocumentItem | null> {
  await requireCapability("document.read");

  const parsed = getDocumentSchema.safeParse({ file_uuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid document identifier",
    );
  }

  const document = await prisma.file.findUnique({
    where: { file_uuid: parsed.data.file_uuid },
  });

  if (!document) return null;

  const result = document as DocumentItem;

  // Validate output shape
  const outputParsed = documentDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/documents] getDocument output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Upload a document file to disk and create a file record in the database.
 *
 * Accepts a FormData-compatible payload with the file metadata and the file
 * buffer. The file is saved to public/uploads/documents/ and a `file` record
 * is created in the database.
 */
export async function uploadDocument(
  data: UploadDocumentInput & { file_buffer?: Buffer },
): Promise<UploadDocumentResult> {
  await requireCapability("document.write");

  const parsed = uploadDocumentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid upload data",
    );
  }

  const { company_id, file_title, file_name, file_type, file_size, file_description } =
    parsed.data;

  // Generate a unique file UUID
  const fileUuid = `file_${crypto.randomUUID()}`;

  // Determine the file extension and storage path
  const ext = file_name ? path.extname(file_name).toLowerCase() : "";
  const storageName = `${fileUuid}${ext}`;
  const relativeDir = path.join("uploads", "documents");
  const relativePath = path.join(relativeDir, storageName);

  // Upload to S3 if configured, otherwise fall back to local disk
  let savedSize: number | null = file_size ?? null;
  let s3Key: string | null = null;

  if (data.file_buffer) {
    if (s3ConfigAvailable()) {
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_TEMP_BUCKET_NAME,
        Key: relativePath,
        Body: data.file_buffer,
        ContentType: file_type ?? undefined,
      });
      await getS3Client().send(command);
      s3Key = relativePath;
      savedSize = data.file_buffer.length;
    } else {
      // Fallback: save to local disk
      const fullDir = path.join(process.cwd(), "public", relativeDir);
      const fullPath = path.join(fullDir, storageName);
      await fs.mkdir(fullDir, { recursive: true });
      await fs.writeFile(fullPath, data.file_buffer);
      savedSize = data.file_buffer.length;
    }
  }

  // Create the database record
  await prisma.file.create({
    data: {
      file_uuid: fileUuid,
      company_id,
      file_title,
      file_description: file_description ?? null,
      file_name,
      file_type: file_type ?? null,
      file_size: savedSize,
      file_s3_path: s3Key ?? `/${relativePath}`,
      file_created_datetime: new Date(),
    },
  });

  revalidatePath("/documents");
  revalidatePath("/uploads/documents");

  const result = {
    file_uuid: fileUuid,
    file_s3_path: s3Key ?? `/${relativePath}`,
  };

  // Validate output shape
  const outputParsed = uploadDocumentResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/documents] uploadDocument output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getDocumentDownloadUrl
// ---------------------------------------------------------------------------

/**
 * Generate a presigned S3 download URL for a document.
 *
 * Looks up the document by file_uuid and, if it has an S3 key stored in
 * `file_s3_path`, returns a time-limited download URL. Returns null if the
 * document is not found, has no S3 key (local file), or S3 is not configured.
 */
export async function getDocumentDownloadUrl(
  file_uuid: string,
): Promise<{ downloadUrl: string; key: string } | null> {
  await requireCapability("document.read");

  if (!s3ConfigAvailable()) {
    return null;
  }

  const parsed = getDocumentSchema.safeParse({ file_uuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid document identifier",
    );
  }

  const document = await prisma.file.findUnique({
    where: { file_uuid: parsed.data.file_uuid },
    select: { file_s3_path: true },
  });

  if (!document?.file_s3_path) {
    return null;
  }

  // If it's a local path (starts with /), we can't generate a presigned URL
  if (document.file_s3_path.startsWith("/")) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_TEMP_BUCKET_NAME,
    Key: document.file_s3_path,
  });

  try {
    const downloadUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: 900, // 15 minutes
    });

    return {
      downloadUrl,
      key: document.file_s3_path,
    };
  } catch {
    return null;
  }
}

/**
 * Deletes a document record by file_uuid (soft-delete via Prisma update).
 */
export async function deleteDocument(
  input: { file_uuid: string },
): Promise<{ success: boolean }> {
  await requireCapability("document.write");

  await prisma.file.update({
    where: { file_uuid: input.file_uuid },
    data: { file_title: `[DELETED] ${new Date().toISOString()}` },
  });

  return { success: true };
}
