"use server";

import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
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
  const fullDir = path.join(process.cwd(), "public", relativeDir);
  const fullPath = path.join(fullDir, storageName);

  // Save file to disk if a buffer was provided
  let savedSize: number | null = file_size ?? null;
  if (data.file_buffer) {
    await fs.mkdir(fullDir, { recursive: true });
    await fs.writeFile(fullPath, data.file_buffer);
    savedSize = data.file_buffer.length;
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
      file_s3_path: `/${relativePath}`,
      file_created_datetime: new Date(),
    },
  });

  revalidatePath("/documents");
  revalidatePath("/uploads/documents");

  const result = {
    file_uuid: fileUuid,
    file_s3_path: `/${relativePath}`,
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
