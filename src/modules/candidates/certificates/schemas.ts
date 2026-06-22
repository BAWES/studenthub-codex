import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCertificatesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCertificateSchema = z.object({
  uuid: z.string().min(1, "Certificate UUID is required"),
});

export const createCertificateSchema = z.object({
  certificateType: z.boolean().optional(),
  certificateTitle: z.string().optional(),
  certificateIssuer: z.string().optional(),
  certificateUrl: z.string().optional(),
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

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type ListCertificatesInput = z.input<typeof listCertificatesSchema>;
export type GetCertificateInput = z.input<typeof getCertificateSchema>;
export type CreateCertificateInput = z.input<typeof createCertificateSchema>;
export type UpdateCertificateInput = z.input<typeof updateCertificateSchema>;
export type DeleteCertificateInput = z.input<typeof deleteCertificateSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const certificateItemSchema = z.object({
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
  certificates: z.array(certificateItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const certificateActionResultSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("success"), message: z.string(), data: certificateItemSchema.optional() }),
  z.object({ operation: z.literal("error"), message: z.string() }),
]);

export const deleteCertificateResultSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("success"), message: z.string() }),
  z.object({ operation: z.literal("error"), message: z.string() }),
]);

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type CertificateItem = z.output<typeof certificateItemSchema>;
export type ListCertificatesResult = z.output<typeof listCertificatesResultSchema>;
export type CertificateActionResult = z.output<typeof certificateActionResultSchema>;
export type DeleteCertificateResult = z.output<typeof deleteCertificateResultSchema>;
