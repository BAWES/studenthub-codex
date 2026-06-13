import { z } from "zod";

// ---------------------------------------------------------------------------
// Get Company Detail
// ---------------------------------------------------------------------------

/**
 * Schema for fetching a single company by ID.
 * companyId is required and must be a positive integer.
 */
export const getCompanyDetailSchema = z.object({
  companyId: z
    .number({ required_error: "Company ID is required" })
    .int("Company ID must be an integer")
    .positive("Company ID must be a positive number"),
});

// ---------------------------------------------------------------------------
// Update Company
// ---------------------------------------------------------------------------

/**
 * Schema for updating a company.
 * All fields except companyId are optional — partial updates.
 */
export const updateCompanySchema = z.object({
  companyId: z
    .number({ required_error: "Company ID is required" })
    .int("Company ID must be an integer")
    .positive("Company ID must be a positive number"),
  company_name: z.string().min(1, "Company name is required").max(255).optional(),
  company_common_name_en: z.string().max(255).optional(),
  company_common_name_ar: z.string().max(255).optional(),
  company_description_en: z.string().optional(),
  company_description_ar: z.string().optional(),
  company_website: z.string().url("Invalid URL").max(2048).optional(),
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

export type GetCompanyDetailInput = z.input<typeof getCompanyDetailSchema>;
export type UpdateCompanyInput = z.input<typeof updateCompanySchema>;

export type CompanyDetailResult = {
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

export type UpdateCompanyResult = {
  company_id: number;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const companyDetailResultSchema = z.object({
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

// Re-export companyAccountDetailOutputSchema from module
export { companyAccountDetailOutputSchema } from "@/modules/companies/schemas";
