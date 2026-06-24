"use server";

// ---------------------------------------------------------------------------
// Admin Candidate [id] — server actions
// ---------------------------------------------------------------------------
// Extended detail and mutation actions for a single candidate.
//
// Actions:
//   - getCandidateDetail              — single candidate detail with full profile,
//                                       placements, and documents
//   - updateCandidateStatus           — update candidate status code
//   - updateCandidate                 — update candidate profile fields
//   - deleteCandidate                 — soft-delete a candidate
//   - adminUploadCandidateDocument    — upload a document (explicit candidateId, admin)
//   - adminDeleteCandidateDocument    — delete a document (explicit candidateId, admin)
// Candidate status convention (from Yii2):
//   10 = active, 20 = inactive, 30 = banned
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  getCandidateDetailSchema,
  updateCandidateStatusSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
  adminUploadDocumentSchema,
  adminDeleteDocumentSchema,
} from "./schemas";
import type {
  UpdateCandidateStatusInput,
  UpdateCandidateInput,
  DeleteCandidateInput,
  CandidateFullDetail,
  CandidateActionResponse,
  AdminDocumentActionResult,
} from "./schemas";

import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// ---------------------------------------------------------------------------
// getCandidateDetail
// ---------------------------------------------------------------------------

/**
 * Get a single candidate with full profile, placements, and documents.
 */
export async function getCandidateDetail(
  candidateId: number,
): Promise<CandidateFullDetail> {
  await requireCapability("candidate.read");

  const parsed = getCandidateDetailSchema.safeParse({ candidateId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate ID");
  }

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: parsed.data.candidateId, deleted: 0 },
    include: {
      store: { select: { store_name: true } },
      country: { select: { country_name_en: true } },
      university: { select: { university_name_en: true } },
      transfer_candidate: {
        where: { deleted: 0 },
        include: {
          transfer: {
            select: {
              transfer_id: true,
              start_date: true,
              end_date: true,
              company: { select: { company_name: true } },
            },
          },
        },
        orderBy: { tc_created_at: "desc" },
        take: 20,
      },
    },
  });

  if (!candidate) {
    return { candidate: null, placements: [], documents: [], metrics: [] };
  }

  const c = candidate as any;

  // Placements from transfer_candidate records
  const placements = (c.transfer_candidate ?? []).map((tc: any) => ({
    transfer_id: tc.transfer?.transfer_id ?? 0,
    company_name: tc.transfer?.company?.company_name ?? tc.company_name ?? null,
    store_name: tc.store_name ?? null,
    hours: tc.hours ?? null,
    amount: tc.candidate_total ? tc.candidate_total.toString() : null,
    paid: tc.paid ?? 0,
    period:
      tc.transfer?.start_date && tc.transfer?.end_date
        ? `${new Date(tc.transfer.start_date).toLocaleDateString("en-KW", { month: "short", day: "numeric" })} – ${new Date(tc.transfer.end_date).toLocaleDateString("en-KW", { month: "short", day: "numeric" })}`
        : "N/A",
  }));

  // Documents derived from candidate profile fields
  const documents: { type: string; label: string; url: string | null }[] = [];

  if (c.candidate_resume) {
    documents.push({ type: "resume", label: "Resume / CV", url: c.candidate_resume });
  }
  if (c.candidate_civil_photo_front) {
    documents.push({ type: "civil_id_front", label: "Civil ID (Front)", url: c.candidate_civil_photo_front });
  }
  if (c.candidate_civil_photo_back) {
    documents.push({ type: "civil_id_back", label: "Civil ID (Back)", url: c.candidate_civil_photo_back });
  }
  if (c.candidate_personal_photo) {
    documents.push({ type: "photo", label: "Personal Photo", url: c.candidate_personal_photo });
  }

  const metrics = [
    { label: "Status", value: c.candidate_status, note: statusLabel(c.candidate_status) },
    { label: "Placements", value: placements.length, note: "Transfers" },
    { label: "Store", value: c.store?.store_name ?? "Unassigned", note: "" },
    { label: "Country", value: c.country?.country_name_en ?? "—", note: "Nationality" },
    { label: "Created", value: c.candidate_created_at?.toISOString() ?? "—", note: "" },
  ];

  return {
    candidate: {
      candidate_id: c.candidate_id,
      candidate_name: c.candidate_name,
      candidate_name_ar: c.candidate_name_ar,
      candidate_email: c.candidate_email,
      candidate_phone: c.candidate_phone ?? null,
      candidate_status: c.candidate_status,
      candidate_gender: c.candidate_gender ?? null,
      candidate_birth_date: c.candidate_birth_date?.toISOString() ?? null,
      candidate_hourly_rate: c.candidate_hourly_rate ? Number(c.candidate_hourly_rate) : null,
      candidate_objective: c.candidate_objective ?? null,
      currency_code: c.currency_code ?? null,
      candidate_created_at: c.candidate_created_at?.toISOString() ?? null,
      candidate_updated_at: c.candidate_updated_at?.toISOString() ?? null,
      store: c.store ? { store_name: c.store.store_name } : null,
      country: c.country ? { country_name_en: c.country.country_name_en } : null,
      university: c.university ? { university_name_en: c.university.university_name_en } : null,
    },
    placements,
    documents,
    metrics,
  };
}

// ---------------------------------------------------------------------------
// updateCandidateStatus
// ---------------------------------------------------------------------------

/** @see statusLabel for human-readable names */
export async function updateCandidateStatus(
  input: UpdateCandidateStatusInput,
): Promise<CandidateActionResponse> {
  await requireCapability("candidate.write");

  const parsed = updateCandidateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { candidateId, status } = parsed.data;

  const existing = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true, candidate_status: true },
  });

  if (!existing) {
    return { operation: "error", message: "Candidate not found" };
  }

  try {
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: {
        candidate_status: status,
        candidate_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${candidateId}`);

    return {
      operation: "success",
      message: `Candidate status updated to "${statusLabel(status)}"`,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update candidate status",
    };
  }
}

// ---------------------------------------------------------------------------
// updateCandidate
// ---------------------------------------------------------------------------

/**
 * Update candidate profile fields. Only provided fields are modified.
 */
export async function updateCandidate(
  input: UpdateCandidateInput,
): Promise<CandidateActionResponse> {
  await requireCapability("candidate.write");

  const parsed = updateCandidateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { candidateId, ...fields } = parsed.data;

  const existing = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true },
  });

  if (!existing) {
    return { operation: "error", message: "Candidate not found" };
  }

  const updateData: Record<string, unknown> = {
    candidate_updated_at: new Date(),
  };

  if (fields.candidateName !== undefined) updateData.candidate_name = fields.candidateName;
  if (fields.candidateNameAr !== undefined) updateData.candidate_name_ar = fields.candidateNameAr;
  if (fields.candidateEmail !== undefined) updateData.candidate_email = fields.candidateEmail;
  if (fields.candidatePhone !== undefined) updateData.candidate_phone = fields.candidatePhone;
  if (fields.candidateGender !== undefined) updateData.candidate_gender = fields.candidateGender;
  if (fields.candidateBirthDate !== undefined) updateData.candidate_birth_date = new Date(fields.candidateBirthDate);
  if (fields.candidateHourlyRate !== undefined) updateData.candidate_hourly_rate = fields.candidateHourlyRate;
  if (fields.currencyCode !== undefined) updateData.currency_code = fields.currencyCode;
  if (fields.storeId !== undefined) updateData.store_id = fields.storeId;
  if (fields.countryId !== undefined) updateData.country_id = fields.countryId;
  if (fields.universityId !== undefined) updateData.university_id = fields.universityId;
  if (fields.candidateObjective !== undefined) updateData.candidate_objective = fields.candidateObjective;

  try {
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: updateData as any,
    });

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${candidateId}`);

    return { operation: "success", message: "Candidate updated successfully" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update candidate",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteCandidate
// ---------------------------------------------------------------------------

/**
 * Soft-delete a candidate by setting deleted = 1.
 * Mirrors the legacy Yii2 CandidateController::actionDelete().
 */
export async function deleteCandidate(
  input: DeleteCandidateInput,
): Promise<CandidateActionResponse> {
  await requireCapability("candidate.write");

  const parsed = deleteCandidateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { candidateId } = parsed.data;

  const existing = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { candidate_id: true },
  });

  if (!existing) {
    return { operation: "error", message: "Candidate not found" };
  }

  try {
    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: {
        deleted: 1,
        candidate_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${candidateId}`);

    return { operation: "success", message: "Candidate deleted successfully" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to delete candidate",
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map numeric status code to a human-readable label.
 * 10 = active, 20 = inactive, 30 = banned
 */
function statusLabel(status: number): string {
  switch (status) {
    case 10: return "Active";
    case 20: return "Inactive";
    case 30: return "Banned";
    default: return `Unknown (${status})`;
  }
}

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

function isS3Key(filePath: string | null): boolean {
  return !!filePath && !filePath.startsWith("/");
}

// Document field map on the candidate model
const DOCUMENT_FIELD_MAP: Record<string, string> = {
  photo: "candidate_personal_photo",
  cv: "candidate_resume",
  video: "candidate_video",
  civilFront: "candidate_civil_photo_front",
  civilBack: "candidate_civil_photo_back",
};

// Document type labels
const DOCUMENT_LABELS: Record<string, string> = {
  photo: "Personal Photo",
  cv: "CV / Resume",
  video: "Video Profile",
  civilFront: "Civil ID (Front)",
  civilBack: "Civil ID (Back)",
};

// Allowed file types and sizes
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

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "candidates");

// ---------------------------------------------------------------------------
// adminUploadCandidateDocument
// ---------------------------------------------------------------------------

/**
 * Upload a document for a candidate (admin version with explicit candidateId).
 *
 * Accepts a FormData containing:
 *   - candidateId (hidden field)
 *   - documentType (hidden field) — one of: photo, cv, video, civilFront, civilBack
 *   - file (the actual file to upload)
 */
export async function adminUploadCandidateDocument(
  _prevState: AdminDocumentActionResult,
  formData: FormData,
): Promise<AdminDocumentActionResult> {
  await requireCapability("candidate.write");

  const rawCandidateId = formData.get("candidateId");
  const rawDocumentType = formData.get("documentType");
  const file = formData.get("file");

  if (!rawCandidateId || !rawDocumentType) {
    return { success: false, error: "candidateId and documentType are required." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file provided. Use 'file' field." };
  }

  const parsed = adminUploadDocumentSchema.safeParse({
    candidateId: rawCandidateId,
    documentType: rawDocumentType,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
    };
  }

  const { candidateId, documentType } = parsed.data;
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
    return {
      success: false,
      error: `Invalid MIME type "${file.type}" for ${documentType}.`,
    };
  }

  // Validate file size
  if (file.size > typeConfig.maxSize) {
    const sizeMB = typeConfig.maxSize / 1024 / 1024;
    return {
      success: false,
      error: `File is too large. Maximum size for ${documentType} is ${sizeMB} MB.`,
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${documentType}_${crypto.randomUUID()}${ext}`;
    let publicPath: string;
    let s3Key: string | undefined;

    if (s3ConfigAvailable()) {
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

    revalidatePath(`/admin/candidates/${candidateId}`);

    return {
      success: true,
      filePath: publicPath,
      s3Key,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Upload failed due to an unknown error.",
    };
  }
}

// ---------------------------------------------------------------------------
// adminDeleteCandidateDocument
// ---------------------------------------------------------------------------

/**
 * Delete a document for a candidate (admin version with explicit candidateId).
 *
 * Accepts a FormData containing:
 *   - candidateId (hidden field)
 *   - documentType (hidden field)
 */
export async function adminDeleteCandidateDocument(
  _prevState: AdminDocumentActionResult,
  formData: FormData,
): Promise<AdminDocumentActionResult> {
  await requireCapability("candidate.write");

  const rawCandidateId = formData.get("candidateId");
  const rawDocumentType = formData.get("documentType");

  if (!rawCandidateId || !rawDocumentType) {
    return { success: false, error: "candidateId and documentType are required." };
  }

  const parsed = adminDeleteDocumentSchema.safeParse({
    candidateId: rawCandidateId,
    documentType: rawDocumentType,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join("; "),
    };
  }

  const { candidateId, documentType } = parsed.data;
  const field = DOCUMENT_FIELD_MAP[documentType];

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: { [field]: true },
    });

    if (!candidate) {
      return { success: false, error: "Candidate not found." };
    }

    const currentPath = (candidate as Record<string, unknown>)[field] as string | null;

    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: { [field]: null },
    });

    // Clean up the stored file
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

    revalidatePath(`/admin/candidates/${candidateId}`);

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Delete failed due to an unknown error.",
    };
  }
}
