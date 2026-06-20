"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  listCertificatesSchema,
  getCertificateSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
  type ListCertificatesInput,
  type GetCertificateInput,
  type CreateCertificateInput,
  type UpdateCertificateInput,
  type DeleteCertificateInput,
  type CertificateItem,
  type ListCertificatesResult,
  type CertificateActionResult,
  type DeleteCertificateResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_certificate row to the shared CertificateItem shape. */
function toItem(row: {
  certificate_uuid: string;
  certificate_type: boolean | null;
  certificate_title: string | null;
  certificate_issuer: string | null;
  certificate_url: string | null;
  candidate_id: number;
  candidate_work_history_id: number | null;
  exam_uuid: string | null;
  store_id: number | null;
  company_id: number | null;
  parent_company_id: number | null;
  start_date: Date | null;
  end_date: Date | null;
  staff_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}): CertificateItem {
  return {
    certificate_uuid: row.certificate_uuid,
    certificate_type: row.certificate_type ?? null,
    certificate_title: row.certificate_title ?? null,
    certificate_issuer: row.certificate_issuer ?? null,
    certificate_url: row.certificate_url ?? null,
    candidate_id: row.candidate_id,
    candidate_work_history_id: row.candidate_work_history_id ?? null,
    exam_uuid: row.exam_uuid ?? null,
    store_id: row.store_id ?? null,
    company_id: row.company_id ?? null,
    parent_company_id: row.parent_company_id ?? null,
    start_date: row.start_date?.toISOString() ?? null,
    end_date: row.end_date?.toISOString() ?? null,
    staff_id: row.staff_id ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidates/certificates] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List certificates for a given candidate.
 * Paginated, ordered by created_at descending.
 */
export async function listCertificates(
  candidateId: number,
  params: ListCertificatesInput = {},
): Promise<ListCertificatesResult> {
  const { page, limit } = listCertificatesSchema.parse(params);
  const skip = (page - 1) * limit;

  const [certificates, total] = await Promise.all([
    prisma.candidate_certificate.findMany({
      where: { candidate_id: candidateId, is_deleted: false },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.candidate_certificate.count({
      where: { candidate_id: candidateId, is_deleted: false },
    }),
  ]);

  const result = {
    certificates: certificates.map(toItem),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listCertificatesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCertificates", outputParsed.error);
  }

  return result;
}

/**
 * Get a single certificate by UUID, scoped to a candidate.
 * Returns null if not found, soft-deleted, or belongs to another candidate.
 */
export async function getCertificate(
  candidateId: number,
  input: GetCertificateInput,
): Promise<CertificateItem | null> {
  const parsed = getCertificateSchema.parse(input);

  const certificate = await prisma.candidate_certificate.findFirst({
    where: {
      certificate_uuid: parsed.uuid,
      candidate_id: candidateId,
      is_deleted: false,
    },
  });

  if (!certificate) return null;

  const item = toItem(certificate);

  const outputParsed = certificateItemSchema.safeParse(item);
  if (!outputParsed.success) {
    logOutputError("getCertificate", outputParsed.error);
  }

  return item;
}

/**
 * Create a new certificate for a candidate.
 */
export async function createCertificate(
  candidateId: number,
  input: CreateCertificateInput,
): Promise<CertificateActionResult> {
  const parsed = createCertificateSchema.parse({
    ...input,
    candidateId,
  });

  const {
    certificateType,
    certificateTitle,
    certificateIssuer,
    certificateUrl,
    candidateWorkHistoryId,
    examUuid,
    storeId,
    companyId,
    parentCompanyId,
    startDate,
    endDate,
  } = parsed;

  try {
    const now = new Date();

    const certificate = await prisma.candidate_certificate.create({
      data: {
        certificate_uuid: crypto.randomUUID(),
        certificate_type: certificateType ?? null,
        certificate_title: certificateTitle ?? null,
        certificate_issuer: certificateIssuer ?? null,
        certificate_url: certificateUrl ?? null,
        candidate_id: candidateId,
        candidate_work_history_id: candidateWorkHistoryId ?? null,
        exam_uuid: examUuid ?? null,
        store_id: storeId ?? null,
        company_id: companyId ?? null,
        parent_company_id: parentCompanyId ?? null,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        is_deleted: false,
        created_at: now,
        updated_at: now,
      },
    });

    const item = toItem(certificate);

    const outputParsed = certificateActionResultSchema.safeParse({
      operation: "success",
      message: "Certificate created",
      data: item,
    });
    if (!outputParsed.success) {
      logOutputError("createCertificate", outputParsed.error);
    }

    return { operation: "success", message: "Certificate created", data: item };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create certificate",
    };
  }
}

/**
 * Update an existing certificate, scoped to a candidate.
 */
export async function updateCertificate(
  candidateId: number,
  input: UpdateCertificateInput,
): Promise<CertificateActionResult> {
  const parsed = updateCertificateSchema.parse(input);
  const { certificateUuid, ...fields } = parsed;

  // Verify ownership
  const existing = await prisma.candidate_certificate.findFirst({
    where: {
      certificate_uuid: certificateUuid,
      candidate_id: candidateId,
      is_deleted: false,
    },
    select: { certificate_uuid: true },
  });

  if (!existing) {
    return { operation: "error", message: "Certificate not found" };
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date(),
  };

  if (fields.certificateType !== undefined) updateData.certificate_type = fields.certificateType;
  if (fields.certificateTitle !== undefined) updateData.certificate_title = fields.certificateTitle;
  if (fields.certificateIssuer !== undefined) updateData.certificate_issuer = fields.certificateIssuer;
  if (fields.certificateUrl !== undefined) updateData.certificate_url = fields.certificateUrl;
  if (fields.candidateWorkHistoryId !== undefined) updateData.candidate_work_history_id = fields.candidateWorkHistoryId;
  if (fields.examUuid !== undefined) updateData.exam_uuid = fields.examUuid;
  if (fields.storeId !== undefined) updateData.store_id = fields.storeId;
  if (fields.companyId !== undefined) updateData.company_id = fields.companyId;
  if (fields.parentCompanyId !== undefined) updateData.parent_company_id = fields.parentCompanyId;
  if (fields.startDate !== undefined) updateData.start_date = new Date(fields.startDate);
  if (fields.endDate !== undefined) updateData.end_date = new Date(fields.endDate);

  try {
    const certificate = await prisma.candidate_certificate.update({
      where: { certificate_uuid: certificateUuid },
      data: updateData as any,
    });

    const item = toItem(certificate);

    return { operation: "success", message: "Certificate updated", data: item };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update certificate",
    };
  }
}

/**
 * Soft-delete a certificate (sets is_deleted = true).
 */
export async function deleteCertificate(
  candidateId: number,
  input: DeleteCertificateInput,
): Promise<DeleteCertificateResult> {
  const parsed = deleteCertificateSchema.parse(input);

  // Verify ownership
  const existing = await prisma.candidate_certificate.findFirst({
    where: {
      certificate_uuid: parsed.certificateUuid,
      candidate_id: candidateId,
      is_deleted: false,
    },
    select: { certificate_uuid: true },
  });

  if (!existing) {
    return { operation: "error" as const, message: "Certificate not found" };
  }

  try {
    await prisma.candidate_certificate.update({
      where: { certificate_uuid: parsed.certificateUuid },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });

    return { operation: "success", message: "Certificate deleted" };
  } catch (err) {
    return {
      operation: "error" as const,
      message: err instanceof Error ? err.message : "Failed to delete certificate",
    };
  }
}
