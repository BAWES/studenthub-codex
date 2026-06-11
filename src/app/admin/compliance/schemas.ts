import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listComplianceRecordsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  type: z.enum(["company", "id_request", "candidate", "all"]).optional().default("all"),
  status: z.string().optional(),
});

export const getComplianceRecordSchema = z.object({
  id: z.string().min(1, "Record ID is required"),
  type: z.enum(["company", "id_request", "candidate"]),
});

export const approveComplianceSchema = z.object({
  id: z.string().min(1, "Record ID is required"),
  type: z.enum(["company", "id_request"]),
});

export const denyComplianceSchema = z.object({
  id: z.string().min(1, "Record ID is required"),
  type: z.enum(["company", "id_request"]),
  reason: z.string().min(1, "Rejection reason is required").max(2000),
});

export const createComplianceRecordSchema = z.object({
  type: z.enum(["company"]),
  company_name: z.string().min(1, "Company name is required").max(255),
  company_email: z.string().email("Invalid email").max(225).optional(),
  company_approved_to_hire: z.boolean().optional().default(false),
});

export const updateComplianceRecordSchema = z.object({
  id: z.string().min(1, "Record ID is required"),
  type: z.enum(["company"]),
  company_approved_to_hire: z.boolean().optional(),
  company_followup: z.boolean().optional(),
  company_status_override: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single compliance row in the listing.
 */
export const complianceRowSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["company", "id_request", "candidate"]),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  status: z.string().min(1),
  updated: z.string().min(1),
});

/**
 * Schema for the compliance summary.
 */
export const complianceSummarySchema = z.object({
  totalCompanies: z.number().int().nonnegative(),
  unapprovedCompanies: z.number().int().nonnegative(),
  pendingIdRequests: z.number().int().nonnegative(),
  unapprovedCandidates: z.number().int().nonnegative(),
  incompleteCandidates: z.number().int().nonnegative(),
});

/**
 * Schema for a metric item used in compliance detail views.
 */
export const complianceMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

/**
 * Schema for an ID request item in company compliance detail.
 */
export const complianceIdRequestItemSchema = z.object({
  id: z.string(),
  status: z.string(),
  rejection_reason: z.string().nullable(),
  created_at: z.date().nullable(),
});

/**
 * Schema for company compliance detail.
 */
export const companyComplianceDetailSchema = z.object({
  type: z.literal("company"),
  company: z
    .object({
      company_id: z.number(),
      company_name: z.string(),
      company_email: z.string().nullable(),
      company_approved_to_hire: z.boolean().nullable(),
      company_created_at: z.date().nullable(),
      company_updated_at: z.date().nullable(),
      staff_name: z.string().nullable(),
      country_name_en: z.string().nullable(),
      no_of_active_requests: z.number().nullable(),
    })
    .nullable(),
  metrics: z.array(complianceMetricSchema),
  idRequests: z.array(complianceIdRequestItemSchema),
});

/**
 * Schema for ID request compliance detail.
 */
export const idRequestComplianceDetailSchema = z.object({
  type: z.literal("id_request"),
  record: z
    .object({
      cir_uuid: z.string(),
      candidate_ids: z.string().nullable(),
      status: z.string().nullable(),
      rejection_reason: z.string().nullable(),
      created_at: z.date().nullable(),
      updated_at: z.date().nullable(),
    })
    .nullable(),
  metrics: z.array(complianceMetricSchema),
});

/**
 * Schema for the listComplianceRecords response.
 */
export const listComplianceRecordsResponseSchema = z.object({
  items: z.array(complianceRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  summary: complianceSummarySchema,
});

/**
 * Schema for create/update/approve/deny mutation responses.
 */
export const complianceMutationResponseSchema = z.object({
  id: z.string(),
  type: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListComplianceRecordsInput = z.input<typeof listComplianceRecordsSchema>;
export type GetComplianceRecordInput = z.input<typeof getComplianceRecordSchema>;
export type ApproveComplianceInput = z.input<typeof approveComplianceSchema>;
export type DenyComplianceInput = z.input<typeof denyComplianceSchema>;
export type CreateComplianceRecordInput = z.input<typeof createComplianceRecordSchema>;
export type UpdateComplianceRecordInput = z.input<typeof updateComplianceRecordSchema>;

export type ComplianceRow = {
  id: string;
  type: "company" | "id_request" | "candidate";
  title: string;
  subtitle: string;
  status: string;
  updated: string;
};

export type ComplianceSummary = {
  totalCompanies: number;
  unapprovedCompanies: number;
  pendingIdRequests: number;
  unapprovedCandidates: number;
  incompleteCandidates: number;
};

export type CompanyComplianceDetail = {
  type: "company";
  company: {
    company_id: number;
    company_name: string;
    company_email: string | null;
    company_approved_to_hire: boolean | null;
    company_created_at: Date | null;
    company_updated_at: Date | null;
    staff_name: string | null;
    country_name_en: string | null;
    no_of_active_requests: number | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
  idRequests: { id: string; status: string; rejection_reason: string | null; created_at: Date | null }[];
};

export type IdRequestComplianceDetail = {
  type: "id_request";
  record: {
    cir_uuid: string;
    candidate_ids: string | null;
    status: string | null;
    rejection_reason: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
};
