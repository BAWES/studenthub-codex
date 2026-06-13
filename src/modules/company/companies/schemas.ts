import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas — used by the module Prisma wrapper functions
// ---------------------------------------------------------------------------

/** Schema for getCompanyLinksByContact */
export const getCompanyLinksByContactSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

/** Schema for findCompanyById */
export const findCompanyByIdSchema = z.object({
  companyId: z.number().int().positive("Company ID is required"),
});

/** Schema for getCompanyDetailTx */
export const getCompanyDetailTxSchema = z.object({
  companyId: z.number().int().positive("Company ID is required"),
});

/** Schema for updateCompany */
export const updateCompanySchema = z.object({
  companyId: z.number().int().positive("Company ID is required"),
  data: z.record(z.string(), z.unknown()),
});

// ---------------------------------------------------------------------------
// Types — raw Prisma return shapes (no formatting)
// ---------------------------------------------------------------------------

export type CompanyLink = {
  company_id: number | null;
};

export type CompanyWithRelations = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_description_en: string | null;
  company_description_ar: string | null;
  company_website: string | null;
  company_email: string | null;
  company_logo: string | null;
  commercial_licence: string | null;
  company_hourly_rate: unknown | null;
  company_bonus_commission: unknown | null;
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
  parent_company_id: number | null;
  country?: { country_name_en: string } | null;
  company?: { company_name: string } | null;
  staff?: { staff_name: string } | null;
};

export type CompanyDetailData = {
  companyId: number;
  raw: unknown | null;
  requests: unknown[];
  contacts: unknown[];
  stores: unknown[];
  notes: unknown[];
};

export type CompanyUpdateResult = {
  company_id: number;
};

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type GetCompanyLinksByContactInput = z.input<typeof getCompanyLinksByContactSchema>;
export type FindCompanyByIdInput = z.input<typeof findCompanyByIdSchema>;
export type GetCompanyDetailTxInput = z.input<typeof getCompanyDetailTxSchema>;
export type UpdateCompanyInput = z.input<typeof updateCompanySchema>;
