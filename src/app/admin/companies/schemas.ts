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
// Output validation — adminCompanyRowSchema
// ---------------------------------------------------------------------------

export const adminCompanyRowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  email: z.string().default("No email"),
  owner: z.string().default("Unassigned"),
  requests: z.number().int().default(0),
  status: z.string(),
  rate: z.string(),
  updated: z.string(),
});

// ---------------------------------------------------------------------------
// Output validation — adminCompanyDetailSchema
// ---------------------------------------------------------------------------

const companyDetailCompanySchema = z.object({
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
});

const companyDetailListItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().default("Untitled request"),
  subtitle: z.string().default(""),
  meta: z.string().default(""),
});

const companyDetailContactItemSchema = z.object({
  id: z.string(),
  title: z.string().default("Contact"),
  subtitle: z.string().default(""),
  meta: z.string().default(""),
});

const companyDetailStoreItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string().default(""),
  meta: z.string().default(""),
});

const companyDetailNoteItemSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  subtitle: z.string().default("Empty note"),
  meta: z.string().default(""),
});

const companyDetailMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

export const adminCompanyDetailSchema = z.object({
  company: companyDetailCompanySchema.nullable(),
  metrics: z.array(companyDetailMetricSchema),
  requests: z.array(companyDetailListItemSchema),
  contacts: z.array(companyDetailContactItemSchema),
  stores: z.array(companyDetailStoreItemSchema),
  notes: z.array(companyDetailNoteItemSchema),
});

// ---------------------------------------------------------------------------
// Output validation — adminCompanyListResponseSchema
// ---------------------------------------------------------------------------

export const adminCompanyListResponseSchema = z.object({
  items: z.array(adminCompanyRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Output validation — adminCompanyToggleResponseSchema
// ---------------------------------------------------------------------------

export const adminCompanyToggleResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListAdminCompaniesInput = z.input<typeof listAdminCompaniesSchema>;
export type GetAdminCompanyInput = z.input<typeof getAdminCompanySchema>;

export type CompanyRow = {
  id: number;
  name: string;
  email: string;
  owner: string;
  requests: number;
  status: string;
  rate: string;
  updated: string;
};

export type CompanyDetail = {
  company: {
    company_id: number;
    company_name: string;
    company_common_name_en: string | null;
    company_email: string | null;
    company_website: string | null;
    company_approved_to_hire: boolean | null;
    company_hourly_rate: number | null;
    currency_code: string | null;
    no_of_active_requests: number | null;
    company_created_at: Date | null;
    company_updated_at: Date | null;
    staff_name: string | null;
    staff_email: string | null;
    country_name_en: string | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
  requests: { id: string; title: string; subtitle: string; meta: string }[];
  contacts: { id: string; title: string; subtitle: string; meta: string }[];
  stores: { id: number; title: string; subtitle: string; meta: string }[];
  notes: { id: string; title: string; subtitle: string; meta: string }[];
};
