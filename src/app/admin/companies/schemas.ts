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
