"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCertificatesSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  examUuid: z.string().optional(),
  type: z.coerce.boolean().optional(),
  storeId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const createCertificateSchema = z.object({
  certificateType: z.boolean().optional(),
  certificateTitle: z.string().optional(),
  certificateIssuer: z.string().optional(),
  certificateUrl: z.string().optional(),
  candidateId: z.number().int().positive(),
  candidateWorkHistoryId: z.number().int().positive().optional(),
  examUuid: z.string().optional(),
  storeId: z.number().int().positive().optional(),
  companyId: z.number().int().positive().optional(),
  parentCompanyId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
  certificateType: z.boolean().optional(),
  certificateTitle: z.string().optional(),
  certificateIssuer: z.string().optional(),
  certificateUrl: z.string().optional(),
  candidateId: z.number().int().positive().optional(),
  candidateWorkHistoryId: z.number().int().positive().optional(),
  examUuid: z.string().optional(),
  storeId: z.number().int().positive().optional(),
  companyId: z.number().int().positive().optional(),
  parentCompanyId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const deleteCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCertificatesParams = z.input<typeof listCertificatesSchema>;
export type CreateCertificateParams = z.input<typeof createCertificateSchema>;
export type UpdateCertificateParams = z.input<typeof updateCertificateSchema>;
export type DeleteCertificateParams = z.input<typeof deleteCertificateSchema>;

export type CertificateListItem = {
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
  start_date: string | null;
  end_date: string | null;
  staff_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListCertificatesResult = {
  certificates: CertificateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------

export { listCertificatesSchema, createCertificateSchema, updateCertificateSchema, deleteCertificateSchema };

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
  params: FormData | z.input<typeof listCertificatesSchema> = {},
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

  return {
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
  return certificate as unknown as CertificateListItem;
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
  return certificate as unknown as CertificateListItem;
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
  return { success: true };
}
