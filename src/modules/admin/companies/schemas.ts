import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/companies actions
// ---------------------------------------------------------------------------

export const listAdminCompaniesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(60),
  q: z.string().optional(),
  status: z.enum(["approved", "not_approved", "all"]).optional().default("all"),
});

export const getAdminCompanySchema = z.object({
  companyId: z.coerce.number().int().positive("Company ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single company row in the admin listing.
 */
export const adminCompanyRowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Company name is required"),
  email: z.string().optional().default("No email"),
  owner: z.string().optional().default("Unassigned"),
  requests: z.number().int().nonnegative().default(0),
  status: z.string().min(1, "Status is required"),
  rate: z.string().min(1, "Rate is required"),
  updated: z.string().min(1, "Updated date is required"),
});

/**
 * Schema for a list item (requests, contacts) in company detail.
 */
const adminCompanyListItemSchema = z.object({
  id: z.string(),
  title: z.string().optional().default("Untitled request"),
  subtitle: z.string().optional().default(""),
  meta: z.string().optional().default(""),
});

/**
 * Schema for a store item in company detail.
 */
const adminCompanyStoreItemSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  subtitle: z.string().optional().default(""),
  meta: z.string().optional().default(""),
});

/**
 * Schema for a note item in company detail.
 */
const adminCompanyNoteItemSchema = z.object({
  id: z.string(),
  title: z.string().optional().default("Note"),
  subtitle: z.string().optional().default("Empty note"),
  meta: z.string().optional().default(""),
});

/**
 * Schema for a contact item in company detail.
 */
const adminCompanyContactItemSchema = z.object({
  id: z.string(),
  title: z.string().optional().default("Contact"),
  subtitle: z.string().optional().default(""),
  meta: z.string().optional().default(""),
});

/**
 * Schema for a metric in the company detail.
 */
const adminCompanyMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

/**
 * Schema for the company detail response from getAdminCompanyDetail.
 */
export const adminCompanyDetailSchema = z.object({
  company: z
    .object({
      company_id: z.number(),
      company_name: z.string(),
      company_common_name_en: z.string().nullable(),
      company_email: z.string().nullable(),
      company_website: z.string().nullable(),
      company_approved_to_hire: z.boolean().nullable(),
      company_hourly_rate: z.number().nullable(),
      currency_code: z.string().nullable(),
      no_of_active_requests: z.number().nullable(),
      company_created_at: z.date().nullable(),
      company_updated_at: z.date().nullable(),
      staff_name: z.string().nullable(),
      staff_email: z.string().nullable(),
      country_name_en: z.string().nullable(),
    })
    .nullable(),
  metrics: z.array(adminCompanyMetricSchema),
  requests: z.array(adminCompanyListItemSchema),
  contacts: z.array(adminCompanyContactItemSchema),
  stores: z.array(adminCompanyStoreItemSchema),
  notes: z.array(adminCompanyNoteItemSchema),
});

/**
 * Schema for the full list response from listAdminCompanies.
 */
export const adminCompanyListResponseSchema = z.object({
  items: z.array(adminCompanyRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the toggleCompanyApproval response.
 */
export const adminCompanyToggleResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListAdminCompaniesInput = z.input<typeof listAdminCompaniesSchema>;
export type GetAdminCompanyInput = z.input<typeof getAdminCompanySchema>;
export type CompanyRow = z.output<typeof adminCompanyRowSchema>;
export type CompanyDetail = z.output<typeof adminCompanyDetailSchema>;
