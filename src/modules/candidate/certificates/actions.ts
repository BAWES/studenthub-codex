"use server";

// ---------------------------------------------------------------------------
// Candidate Certificates — module-level server actions
// ---------------------------------------------------------------------------
// Ported from app/candidate/certificates and src/modules/candidates/certificates.
// Handles session extraction, Zod validation, Prisma queries, and output
// validation in one cohesive layer.
//
// Actions:
//   - listCertificates    — list non-deleted certificates (newest first)
//   - getCertificate       — single certificate by UUID, scoped to candidate
//   - createCertificate    — create a new certificate
//   - updateCertificate    — update an existing certificate (ownership verified)
//   - deleteCertificate    — soft-delete a certificate (ownership verified)
// ---------------------------------------------------------------------------

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
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
// Internal helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_certificate row to the shared CertificateItem shape. */
function toItem(row: Record<string, unknown>): CertificateItem {
  return {
    certificate_uuid: row.certificate_uuid as string,
    certificate_type: (row.certificate_type ?? null) as boolean | null,
    certificate_title: (row.certificate_title ?? null) as string | null,
    certificate_issuer: (row.certificate_issuer ?? null) as string | null,
    certificate_url: (row.certificate_url ?? null) as string | null,
    candidate_id: row.candidate_id as number,
    candidate_work_history_id: (row.candidate_work_history_id ?? null) as number | null,
    exam_uuid: (row.exam_uuid ?? null) as string | null,
    store_id: (row.store_id ?? null) as number | null,
    company_id: (row.company_id ?? null) as number | null,
    parent_company_id: (row.parent_company_id ?? null) as number | null,
    start_date: (row.start_date instanceof Date ? row.start_date.toISOString() : null) as string | null,
    end_date: (row.end_date instanceof Date ? row.end_date.toISOString() : null) as string | null,
    staff_id: (row.staff_id ?? null) as number | null,
    created_at: row.created_at as Date | null,
    updated_at: row.updated_at as Date | null,
  };
}

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidate/certificates] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List certificates for the authenticated candidate.
 * Paginated, ordered by created_at descending.
 */
export async function listCertificates(
  params: ListCertificatesInput = {},
): Promise<ListCertificatesResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listCertificatesSchema.safeParse(params);
  if (!parsed.success) {
    return { certificates: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
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
    certificates: certificates.map((c) => toItem(c as unknown as Record<string, unknown>)),
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
 * Get a single certificate by UUID, scoped to the authenticated candidate.
 */
export async function getCertificate(uuid: string): Promise<CertificateItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getCertificateSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid certificate UUID");
  }

  const certificate = await prisma.candidate_certificate.findFirst({
    where: {
      certificate_uuid: parsed.data.uuid,
      candidate_id: candidateId,
      is_deleted: false,
    },
  });

  if (!certificate) return null;

  const item = toItem(certificate as unknown as Record<string, unknown>);

  const outputParsed = certificateItemSchema.safeParse(item);
  if (!outputParsed.success) {
    logOutputError("getCertificate", outputParsed.error);
  }

  return item;
}

/**
 * Create a new certificate for the authenticated candidate.
 */
export async function createCertificate(
  input: CreateCertificateInput,
): Promise<CertificateActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = createCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const now = new Date();
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
    } = parsed.data;

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

    const item = toItem(certificate as unknown as Record<string, unknown>);
    const outputParsed = certificateActionResultSchema.safeParse({
      operation: "success",
      message: "Certificate created",
      data: item,
    });
    if (!outputParsed.success) {
      logOutputError("createCertificate", outputParsed.error);
    }

    revalidatePath("/candidate/certificates");

    return { operation: "success", message: "Certificate created", data: item };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create certificate",
    };
  }
}

/**
 * Update an existing certificate, scoped to the authenticated candidate.
 */
export async function updateCertificate(
  input: UpdateCertificateInput,
): Promise<CertificateActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = updateCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { certificateUuid, ...fields } = parsed.data;

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

  try {
    const updateData: Record<string, unknown> = { updated_at: new Date() };
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

    const certificate = await prisma.candidate_certificate.update({
      where: { certificate_uuid: certificateUuid },
      data: updateData as any,
    });

    const item = toItem(certificate as unknown as Record<string, unknown>);
    revalidatePath("/candidate/certificates");

    return { operation: "success", message: "Certificate updated", data: item };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update certificate",
    };
  }
}

/**
 * Soft-delete a certificate, scoped to the authenticated candidate.
 */
export async function deleteCertificate(
  input: DeleteCertificateInput,
): Promise<DeleteCertificateResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = deleteCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Verify ownership
  const existing = await prisma.candidate_certificate.findFirst({
    where: {
      certificate_uuid: parsed.data.certificateUuid,
      candidate_id: candidateId,
      is_deleted: false,
    },
    select: { certificate_uuid: true },
  });

  if (!existing) {
    return { operation: "error", message: "Certificate not found" };
  }

  try {
    await prisma.candidate_certificate.update({
      where: { certificate_uuid: parsed.data.certificateUuid },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });

    revalidatePath("/candidate/certificates");
    return { operation: "success", message: "Certificate deleted" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to delete certificate",
    };
  }
}
