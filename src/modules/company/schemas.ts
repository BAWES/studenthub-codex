import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCompaniesSchema = z.object({
  nameFilter: z.string().optional(),
  status: z
    .union([z.literal("active"), z.literal("inactive"), z.literal("")])
    .optional(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});

export const getCompanySchema = z.object({
  companyId: z.number().int().positive("Company ID is required"),
});

export type ListCompaniesParams = z.input<typeof listCompaniesSchema>;
export type GetCompanyParams = z.input<typeof getCompanySchema>;

// ---------------------------------------------------------------------------
// Output validation schemas (used by actions-list.ts)
// ---------------------------------------------------------------------------

/**
 * Schema for a single company item in the list response (actions-list.ts).
 */
export const companyListItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_email: z.string().nullable(),
  company_website: z.string().nullable(),
  company_logo: z.string().nullable(),
  commission: z.number().nullable(),
  total_candidate: z.number().nullable(),
  no_of_active_requests: z.number().nullable(),
  followup: z.boolean().nullable(),
  currency_code: z.string().nullable(),
  // Present only in getCompany detail response
  company_description_en: z.string().nullable().optional(),
  company_description_ar: z.string().nullable().optional(),
  commercial_licence: z.string().nullable().optional(),
  company_hourly_rate: z.number().nullable().optional(),
  company_bonus_commission: z.number().nullable().optional(),
  parent_company_id: z.number().nullable().optional(),
  staff_id: z.number().nullable().optional(),
});

/**
 * Schema for the listCompanies response (actions-list.ts).
 */
export const listCompaniesResultSchema = z.object({
  items: z.array(companyListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
});

/**
 * Schema for the getCompany response (single item or null).
 */
export const companyDetailResultSchema = companyListItemSchema.nullable();

// ---------------------------------------------------------------------------
// Output validation schemas (used by actions.ts — admin-level)
// ---------------------------------------------------------------------------

/**
 * Schema for a single company item returned by admin listCompanies / getCompany.
 */
export const adminCompanyItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_email: z.string().nullable(),
  company_website: z.string().nullable(),
  company_logo: z.string().nullable(),
  commercial_licence: z.string().nullable(),
  company_hourly_rate: z.number().nullable(),
  company_bonus_commission: z.number().nullable(),
  company_approved_to_hire: z.boolean(),
  company_status_override: z.boolean(),
  company_followup: z.boolean().nullable(),
  total_candidate: z.union([z.number().int(), z.bigint()]).nullable(),
  no_of_active_requests: z.number().nullable(),
  country_id: z.number().nullable(),
  currency_code: z.string().nullable(),
  parent_company_id: z.number().nullable(),
  staff_id: z.number().nullable(),
  company_created_at: z.coerce.date(),
  company_updated_at: z.coerce.date(),
});

/**
 * Schema for the admin listCompanies response.
 */
export const adminListCompaniesResultSchema = z.object({
  companies: z.array(adminCompanyItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for admin getCompany response (single item or null).
 */
export const adminCompanyDetailResultSchema = adminCompanyItemSchema.nullable();

/**
 * Schema for form-action results (addCompanyContact, removeCompanyContact, etc.).
 * These return { error: string }.
 */
export const companyActionResultSchema = z.object({
  error: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CompanyListItem = z.output<typeof companyListItemSchema>;
export type ListCompaniesResult = z.output<typeof listCompaniesResultSchema>;
export type CompanyDetailResult = z.output<typeof companyDetailResultSchema>;

export type AdminCompanyItem = z.output<typeof adminCompanyItemSchema>;
export type AdminListCompaniesResult = z.output<typeof adminListCompaniesResultSchema>;
export type AdminCompanyDetailResult = z.output<typeof adminCompanyDetailResultSchema>;
export type CompanyActionResult = z.output<typeof companyActionResultSchema>;
