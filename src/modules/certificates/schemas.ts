import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCertificatesSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  examUuid: z.string().optional(),
  type: z.coerce.boolean().optional(),
  storeId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createCertificateSchema = z.object({
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

export const updateCertificateSchema = z.object({
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

export const deleteCertificateSchema = z.object({
  certificateUuid: z.string().min(1, "Certificate UUID is required"),
});

export const getCertificateSchema = z.object({
  uuid: z.string().min(1, "Certificate UUID is required"),
});

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type ListCertificatesParams = z.input<typeof listCertificatesSchema>;
export type CreateCertificateParams = z.input<typeof createCertificateSchema>;
export type UpdateCertificateParams = z.input<typeof updateCertificateSchema>;
export type DeleteCertificateParams = z.input<typeof deleteCertificateSchema>;
export type GetCertificateParams = z.input<typeof getCertificateSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const certificateListItemSchema = z.object({
  certificate_uuid: z.string(),
  certificate_type: z.boolean().nullable(),
  certificate_title: z.string().nullable(),
  certificate_issuer: z.string().nullable(),
  certificate_url: z.string().nullable(),
  candidate_id: z.number(),
  candidate_work_history_id: z.number().nullable(),
  exam_uuid: z.string().nullable(),
  store_id: z.number().nullable(),
  company_id: z.number().nullable(),
  parent_company_id: z.number().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  staff_id: z.number().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listCertificatesResultSchema = z.object({
  certificates: z.array(certificateListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const deleteCertificateResultSchema = z.object({
  success: z.boolean(),
});

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type CertificateListItem = z.output<typeof certificateListItemSchema>;
export type ListCertificatesResult = z.output<typeof listCertificatesResultSchema>;
export type DeleteCertificateResult = z.output<typeof deleteCertificateResultSchema>;
