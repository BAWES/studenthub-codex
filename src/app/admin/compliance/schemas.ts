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
