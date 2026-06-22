import { z } from "zod";

// ---------------------------------------------------------------------------
// List Companies
// ---------------------------------------------------------------------------

export const listCompaniesSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().min(1).max(255).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().max(3).optional(),
});

// ---------------------------------------------------------------------------
// Get Company
// ---------------------------------------------------------------------------

export const getCompanySchema = z.object({
  companyId: z.number({ required_error: "Company ID is required" }).int().positive(),
});

// ---------------------------------------------------------------------------
// Create Company
// ---------------------------------------------------------------------------

export const createCompanySchema = z.object({
  company_name: z
    .string({ required_error: "Company name is required" })
    .min(1, "Company name is required")
    .max(255),
  company_common_name_en: z.string().max(255).optional(),
  company_common_name_ar: z.string().max(255).optional(),
  company_description_en: z.string().optional(),
  company_description_ar: z.string().optional(),
  company_website: z.string().url("Invalid URL").optional(),
  company_email: z.string().email("Invalid email").max(225).optional(),
  commercial_licence: z.string().max(255).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().max(3).optional(),
  company_hourly_rate: z.number().positive().optional(),
  company_bonus_commission: z.number().min(0).max(100).optional(),
});

// ---------------------------------------------------------------------------
// Update Company
// ---------------------------------------------------------------------------

export const updateCompanySchema = z.object({
  companyId: z.number({ required_error: "Company ID is required" }).int().positive(),
  company_name: z.string().min(1, "Company name is required").max(255).optional(),
  company_common_name_en: z.string().max(255).optional(),
  company_common_name_ar: z.string().max(255).optional(),
  company_description_en: z.string().optional(),
  company_description_ar: z.string().optional(),
  company_website: z.string().url("Invalid URL").optional(),
  company_email: z.string().email("Invalid email").max(225).optional(),
  commercial_licence: z.string().max(255).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().max(3).optional(),
  company_hourly_rate: z.number().positive().optional(),
  company_bonus_commission: z.number().min(0).max(100).optional(),
  company_followup: z.boolean().optional(),
  company_approved_to_hire: z.boolean().optional(),
  company_status_override: z.boolean().optional(),
  parent_company_id: z.number().int().positive().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCompaniesInput = z.input<typeof listCompaniesSchema>;
export type GetCompanyInput = z.input<typeof getCompanySchema>;
export type CreateCompanyInput = z.input<typeof createCompanySchema>;
export type UpdateCompanyInput = z.input<typeof updateCompanySchema>;

export type CompanyListItem = {
  company_id: number;
  company_name: string;
  company_email: string | null;
  company_website: string | null;
  country_name: string | null;
  country_id: number | null;
  no_of_active_requests: number | null;
  total_candidate: bigint | number | null;
  company_updated_at: Date;
  currency_code: string | null;
  commercial_licence: string | null;
};

export type CompanyDetail = {
  company_id: number;
  parent_company_id: number | null;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_description_en: string | null;
  company_description_ar: string | null;
  company_website: string | null;
  company_email: string | null;
  company_logo: string | null;
  commercial_licence: string | null;
  company_hourly_rate: number | null;
  company_bonus_commission: number | null;
  company_followup: boolean | null;
  total_candidate: bigint | number | null;
  no_of_active_requests: number | null;
  is_request_updates_in_30_days: boolean | null;
  company_approved_to_hire: boolean | null;
  company_status_override: boolean | null;
  company_created_at: Date;
  company_updated_at: Date;
  last_request_datetime: Date | null;
  last_payment_datetime: Date | null;
  country_id: number | null;
  currency_code: string | null;
  country_name: string | null;
  parent_company_name: string | null;
  staff_name: string | null;
};

export type ListCompaniesResult = {
  companies: CompanyListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const companyListItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_email: z.string().nullable(),
  company_website: z.string().nullable(),
  country_name: z.string().nullable(),
  country_id: z.number().nullable(),
  no_of_active_requests: z.number().nullable(),
  total_candidate: z.union([z.bigint(), z.number()]).nullable(),
  company_updated_at: z.date(),
  currency_code: z.string().nullable(),
  commercial_licence: z.string().nullable(),
});

export const listCompaniesResultSchema = z.object({
  companies: z.array(companyListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const companyDetailSchema = z.object({
  company_id: z.number().int(),
  parent_company_id: z.number().nullable(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_description_en: z.string().nullable(),
  company_description_ar: z.string().nullable(),
  company_website: z.string().nullable(),
  company_email: z.string().nullable(),
  company_logo: z.string().nullable(),
  commercial_licence: z.string().nullable(),
  company_hourly_rate: z.number().nullable(),
  company_bonus_commission: z.number().nullable(),
  company_followup: z.boolean().nullable(),
  total_candidate: z.union([z.bigint(), z.number()]).nullable(),
  no_of_active_requests: z.number().nullable(),
  is_request_updates_in_30_days: z.boolean().nullable(),
  company_approved_to_hire: z.boolean().nullable(),
  company_status_override: z.boolean().nullable(),
  company_created_at: z.date(),
  company_updated_at: z.date(),
  last_request_datetime: z.date().nullable(),
  last_payment_datetime: z.date().nullable(),
  country_id: z.number().nullable(),
  currency_code: z.string().nullable(),
  country_name: z.string().nullable(),
  parent_company_name: z.string().nullable(),
  staff_name: z.string().nullable(),
});

export const companyCreateResultSchema = z.object({
  company_id: z.number().int(),
});

export const companyAccountRowSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  country: z.string(),
  requests: z.number(),
  status: z.string(),
  rate: z.string(),
  updated: z.string(),
});
