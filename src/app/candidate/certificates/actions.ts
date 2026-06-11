"use server";

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
} from "./schemas";
import {
  type ListCertificatesResult,
  type CertificateListItem,
} from "@/modules/certificates/schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CertificateActionResponse = {
  operation: "success" | "error";
  message: string;
  data?: CertificateListItem;
};

// ---------------------------------------------------------------------------
// listCertificates
// ---------------------------------------------------------------------------

/**
 * List certificates for the authenticated candidate.
 * Automatically scopes results to the logged-in candidate.
 * Paginated, ordered by created_at descending.
 */
export async function listCertificates(
  params: { page?: number; limit?: number } = {},
): Promise<ListCertificatesResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listCertificatesSchema.safeParse({
    ...params,
    candidateId,
  });
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

  return {
    certificates: certificates.map((c): CertificateListItem => ({
      certificate_uuid: c.certificate_uuid,
      certificate_type: c.certificate_type ?? null,
      certificate_title: c.certificate_title ?? null,
      certificate_issuer: c.certificate_issuer ?? null,
      certificate_url: c.certificate_url ?? null,
      candidate_id: c.candidate_id,
      candidate_work_history_id: c.candidate_work_history_id ?? null,
      exam_uuid: c.exam_uuid ?? null,
      store_id: c.store_id ?? null,
      company_id: c.company_id ?? null,
      parent_company_id: c.parent_company_id ?? null,
      start_date: c.start_date?.toISOString() ?? null,
      end_date: c.end_date?.toISOString() ?? null,
      staff_id: c.staff_id ?? null,
      created_at: c.created_at ?? null,
      updated_at: c.updated_at ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getCertificate
// ---------------------------------------------------------------------------

/**
 * Get a single certificate by UUID, scoped to the authenticated candidate.
 * Returns null if the certificate is not found, soft-deleted, or belongs
 * to another candidate.
 */
export async function getCertificate(
  uuid: string,
): Promise<CertificateListItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getCertificateSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid certificate UUID");
  }

  const certificate = await prisma.candidate_certificate.findFirst({
    where: {
      certificate_uuid: uuid,
      candidate_id: candidateId,
      is_deleted: false,
    },
  });

  if (!certificate) return null;

  return {
    certificate_uuid: certificate.certificate_uuid,
    certificate_type: certificate.certificate_type ?? null,
    certificate_title: certificate.certificate_title ?? null,
    certificate_issuer: certificate.certificate_issuer ?? null,
    certificate_url: certificate.certificate_url ?? null,
    candidate_id: certificate.candidate_id,
    candidate_work_history_id: certificate.candidate_work_history_id ?? null,
    exam_uuid: certificate.exam_uuid ?? null,
    store_id: certificate.store_id ?? null,
    company_id: certificate.company_id ?? null,
    parent_company_id: certificate.parent_company_id ?? null,
    start_date: certificate.start_date?.toISOString() ?? null,
    end_date: certificate.end_date?.toISOString() ?? null,
    staff_id: certificate.staff_id ?? null,
    created_at: certificate.created_at ?? null,
    updated_at: certificate.updated_at ?? null,
  };
}

// ---------------------------------------------------------------------------
// createCertificate
// ---------------------------------------------------------------------------

/**
 * Create a new certificate for the authenticated candidate.
 * Automatically scopes the certificate to the logged-in candidate.
 */
export async function createCertificate(
  input: {
    certificateType?: boolean;
    certificateTitle?: string;
    certificateIssuer?: string;
    certificateUrl?: string;
    candidateWorkHistoryId?: number;
    examUuid?: string;
    storeId?: number;
    companyId?: number;
    parentCompanyId?: number;
    startDate?: string;
    endDate?: string;
  },
): Promise<CertificateActionResponse> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = createCertificateSchema.safeParse({
    ...input,
    candidateId,
  });
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

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

    revalidatePath("/candidate/certificates");

    return {
      operation: "success",
      message: "Certificate created",
      data: certificate as unknown as CertificateListItem,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to create certificate",
    };
  }
}

// ---------------------------------------------------------------------------
// updateCertificate
// ---------------------------------------------------------------------------

/**
 * Update an existing certificate, scoped to the authenticated candidate.
 * Only the certificate owner can update their own certificates.
 */
export async function updateCertificate(
  input: {
    certificateUuid: string;
    certificateType?: boolean;
    certificateTitle?: string;
    certificateIssuer?: string;
    certificateUrl?: string;
    candidateWorkHistoryId?: number;
    examUuid?: string;
    storeId?: number;
    companyId?: number;
    parentCompanyId?: number;
    startDate?: string;
    endDate?: string;
  },
): Promise<CertificateActionResponse> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = updateCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
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

    revalidatePath("/candidate/certificates");

    return {
      operation: "success",
      message: "Certificate updated",
      data: certificate as unknown as CertificateListItem,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update certificate",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteCertificate
// ---------------------------------------------------------------------------

/**
 * Soft-delete a certificate, scoped to the authenticated candidate.
 * Sets is_deleted = true instead of removing the record.
 */
export async function deleteCertificate(
  certificateUuid: string,
): Promise<CertificateActionResponse> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = deleteCertificateSchema.safeParse({ certificateUuid });
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

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
    await prisma.candidate_certificate.update({
      where: { certificate_uuid: certificateUuid },
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
