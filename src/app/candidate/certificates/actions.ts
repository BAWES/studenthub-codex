"use server";

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCertificatesSchema,
  getCertificateSchema,
  type ListCertificatesResult,
  type CertificateListItem,
} from "@/modules/certificates/actions";

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
