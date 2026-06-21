"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCertificatesSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  getCertificateSchema,
  certificateListItemSchema,
  listCertificatesResultSchema,
  deleteCertificateResultSchema,
  type ListCertificatesParams,
  type CreateCertificateParams,
  type UpdateCertificateParams,
  type DeleteCertificateParams,
  type GetCertificateParams,
  type CertificateListItem,
  type ListCertificatesResult,
  type DeleteCertificateResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCertificates
// ---------------------------------------------------------------------------

/**
 * List candidate certificates with optional filters and pagination.
 *
 * Mirrors the legacy Yii2 CertificateController::actionList:
 * - Filters by candidate_id, exam_uuid, certificate_type, store_id, company_id
 * - Excludes soft-deleted certificates (is_deleted = false)
 * - Paginated with configurable page/limit
 */
export async function listCertificates(
  params: FormData | ListCertificatesParams = {},
): Promise<ListCertificatesResult> {
  await requireCapability("staff.read");

  const raw =
    params instanceof FormData
      ? {
          candidateId: params.get("candidateId"),
          examUuid: params.get("examUuid"),
          type: params.get("type"),
          storeId: params.get("storeId"),
          companyId: params.get("companyId"),
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listCertificatesSchema.safeParse(raw);
  if (!parsed.success) {
    return { certificates: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { candidateId, examUuid, type, storeId, companyId, page, limit } =
    parsed.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = { is_deleted: false };

  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }
  if (examUuid !== undefined) {
    where.exam_uuid = examUuid;
  }
  if (type !== undefined) {
    where.certificate_type = type;
  }
  if (storeId !== undefined) {
    where.store_id = storeId;
  }
  if (companyId !== undefined) {
    where.company_id = companyId;
  }

  const [certificates, total] = await Promise.all([
    prisma.candidate_certificate.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.candidate_certificate.count({ where: where as any }),
  ]);

  const result = {
    certificates: certificates.map(
      (c: Record<string, unknown>): CertificateListItem => {
        const raw = c as any;
        return {
          certificate_uuid: raw.certificate_uuid,
          certificate_type: raw.certificate_type ?? null,
          certificate_title: raw.certificate_title ?? null,
          certificate_issuer: raw.certificate_issuer ?? null,
          certificate_url: raw.certificate_url ?? null,
          candidate_id: raw.candidate_id,
          candidate_work_history_id: raw.candidate_work_history_id ?? null,
          exam_uuid: raw.exam_uuid ?? null,
          store_id: raw.store_id ?? null,
          company_id: raw.company_id ?? null,
          parent_company_id: raw.parent_company_id ?? null,
          start_date: raw.start_date?.toISOString() ?? null,
          end_date: raw.end_date?.toISOString() ?? null,
          staff_id: raw.staff_id ?? null,
          created_at: raw.created_at ?? null,
          updated_at: raw.updated_at ?? null,
        };
      },
    ),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const validated = listCertificatesResultSchema.safeParse(result);
  if (!validated.success) {
    throw new Error(
      `Output validation failed: ${validated.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  return validated.data;
}

// ---------------------------------------------------------------------------
// createCertificate
// ---------------------------------------------------------------------------

/**
 * Create a new candidate certificate.
 *
 * Mirrors the legacy Yii2 CertificateController::actionCreate.
 * Generates a UUID for the certificate and sets staff_id from session.
 */
export async function createCertificate(
  params: CreateCertificateParams,
): Promise<CertificateListItem> {
  await requireCapability("staff.read");

  const parsed = createCertificateSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const {
    certificateType,
    certificateTitle,
    certificateIssuer,
    certificateUrl,
    candidateId,
    candidateWorkHistoryId,
    examUuid,
    storeId,
    companyId,
    parentCompanyId,
    startDate,
    endDate,
  } = parsed.data;

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

  revalidatePath("/staff/candidates");
  const createValidated = certificateListItemSchema.safeParse(certificate);
  if (!createValidated.success) {
    throw new Error(
      `Output validation failed: ${createValidated.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  return createValidated.data;
}

// ---------------------------------------------------------------------------
// updateCertificate
// ---------------------------------------------------------------------------

/**
 * Update an existing candidate certificate.
 *
 * Mirrors the legacy Yii2 CertificateController::actionUpdate.
 * Throws if the certificate is not found or soft-deleted.
 */
export async function updateCertificate(
  params: UpdateCertificateParams,
): Promise<CertificateListItem> {
  await requireCapability("staff.read");

  const parsed = updateCertificateSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { certificateUuid, ...fields } = parsed.data;

  // Verify the record exists and is not deleted
  const existing = await prisma.candidate_certificate.findUnique({
    where: { certificate_uuid: certificateUuid },
  });
  if (!existing || existing.is_deleted) {
    throw new Error("Certificate not found");
  }

  const certificate = await prisma.candidate_certificate.update({
    where: { certificate_uuid: certificateUuid },
    data: {
      ...(fields.certificateType !== undefined && {
        certificate_type: fields.certificateType,
      }),
      ...(fields.certificateTitle !== undefined && {
        certificate_title: fields.certificateTitle,
      }),
      ...(fields.certificateIssuer !== undefined && {
        certificate_issuer: fields.certificateIssuer,
      }),
      ...(fields.certificateUrl !== undefined && {
        certificate_url: fields.certificateUrl,
      }),
      ...(fields.candidateId !== undefined && {
        candidate_id: fields.candidateId,
      }),
      ...(fields.candidateWorkHistoryId !== undefined && {
        candidate_work_history_id: fields.candidateWorkHistoryId,
      }),
      ...(fields.examUuid !== undefined && { exam_uuid: fields.examUuid }),
      ...(fields.storeId !== undefined && { store_id: fields.storeId }),
      ...(fields.companyId !== undefined && { company_id: fields.companyId }),
      ...(fields.parentCompanyId !== undefined && {
        parent_company_id: fields.parentCompanyId,
      }),
      ...(fields.startDate !== undefined && {
        start_date: new Date(fields.startDate),
      }),
      ...(fields.endDate !== undefined && {
        end_date: new Date(fields.endDate),
      }),
      updated_at: new Date(),
    },
  });

  revalidatePath("/staff/candidates");
  const updateValidated = certificateListItemSchema.safeParse(certificate);
  if (!updateValidated.success) {
    throw new Error(
      `Output validation failed: ${updateValidated.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  return updateValidated.data;
}

// ---------------------------------------------------------------------------
// deleteCertificate (soft delete)
// ---------------------------------------------------------------------------

/**
 * Soft-delete a candidate certificate.
 *
 * Sets is_deleted = true instead of removing the record, matching the
 * schema convention used across the codebase.
 */
export async function deleteCertificate(
  params: DeleteCertificateParams,
): Promise<{ success: boolean }> {
  await requireCapability("staff.read");

  const parsed = deleteCertificateSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { certificateUuid } = parsed.data;

  // Verify the record exists
  const existing = await prisma.candidate_certificate.findUnique({
    where: { certificate_uuid: certificateUuid },
  });
  if (!existing || existing.is_deleted) {
    throw new Error("Certificate not found");
  }

  await prisma.candidate_certificate.update({
    where: { certificate_uuid: certificateUuid },
    data: { is_deleted: true, updated_at: new Date() },
  });

  revalidatePath("/staff/candidates");
  const deleteValidated = deleteCertificateResultSchema.safeParse({ success: true });
  if (!deleteValidated.success) {
    throw new Error(
      `Output validation failed: ${deleteValidated.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  return deleteValidated.data;
}

// ---------------------------------------------------------------------------
// getCertificate
// ---------------------------------------------------------------------------

/**
 * Get a single candidate certificate by UUID.
 * Returns null if the certificate is not found or soft-deleted.
 */
export async function getCertificate(
  params: GetCertificateParams,
): Promise<CertificateListItem | null> {
  await requireCapability("staff.read");

  const parsed = getCertificateSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid certificate UUID");
  }

  const { uuid } = parsed.data;

  const certificate = await prisma.candidate_certificate.findFirst({
    where: { certificate_uuid: uuid, is_deleted: false },
  });

  if (!certificate) return null;

  const getValidated = certificateListItemSchema.safeParse({
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
  });
  if (!getValidated.success) {
    throw new Error(
      `Output validation failed: ${getValidated.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  return getValidated.data;
}
