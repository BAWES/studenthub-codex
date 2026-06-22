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

// ---------------------------------------------------------------------------
// Output validation schemas — validate Prisma return shapes
// ---------------------------------------------------------------------------

/** Schema for a single company link */
export const companyLinkOutputSchema = z.object({
  company_id: z.number().int().nullable(),
});

/** Schema for the staff sub-object in company detail */
const companyStaffOutputSchema = z.object({
  staff_name: z.string(),
  staff_email: z.string(),
}).nullable();

/** Schema for the country sub-object in company detail */
const companyCountryOutputSchema = z.object({
  country_name_en: z.string(),
}).nullable();

/** Schema for the main company detail object (from findCompanyById / getCompanyDetailTx[0]) */
export const companyWithRelationsOutputSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_description_en: z.string().nullable(),
  company_description_ar: z.string().nullable(),
  company_website: z.string().nullable(),
  company_email: z.string().nullable(),
  company_logo: z.string().nullable(),
  commercial_licence: z.string().nullable(),
  company_hourly_rate: z.unknown().nullable(),
  company_bonus_commission: z.unknown().nullable(),
  company_followup: z.boolean().nullable(),
  total_candidate: z.union([z.number(), z.bigint()]).nullable(),
  no_of_active_requests: z.number().int().nullable(),
  is_request_updates_in_30_days: z.boolean().nullable(),
  company_approved_to_hire: z.boolean().nullable(),
  company_status_override: z.boolean().nullable(),
  company_created_at: z.date(),
  company_updated_at: z.date(),
  last_request_datetime: z.date().nullable(),
  last_payment_datetime: z.date().nullable(),
  country_id: z.number().int().nullable(),
  currency_code: z.string().nullable(),
  parent_company_id: z.number().int().nullable(),
  country: companyCountryOutputSchema,
  company: z.object({ company_name: z.string() }).nullable(),
  staff: companyStaffOutputSchema,
}).nullable();

/** Schema for a request row in company detail */
const companyRequestOutputSchema = z.object({
  request_uuid: z.string(),
  request_position_title: z.string(),
  request_status: z.string(),
  request_number_of_employees: z.number().int(),
  request_updated_datetime: z.date(),
});

/** Schema for a contact row in company detail */
const companyContactRowOutputSchema = z.object({
  company_contact_uuid: z.string(),
  contact_position: z.string().nullable(),
  allow_access: z.boolean().nullable(),
  contact: z.object({
    contact_name: z.string(),
    contact_email: z.string(),
  }).nullable(),
});

/** Schema for a store row in company detail */
const companyStoreRowOutputSchema = z.object({
  store_id: z.number().int(),
  store_name: z.string(),
  store_status: z.string(),
});

/** Schema for a note row in company detail */
const companyNoteRowOutputSchema = z.object({
  note_uuid: z.string(),
  note_type: z.string(),
  note_text: z.string(),
  note_created_datetime: z.date(),
});

/** Schema for the full company detail transaction result */
export const companyDetailTxOutputSchema = z.tuple([
  companyWithRelationsOutputSchema,
  z.array(companyRequestOutputSchema),
  z.array(companyContactRowOutputSchema),
  z.array(companyStoreRowOutputSchema),
  z.array(companyNoteRowOutputSchema),
]);

/** Schema for updateCompanyById result */
export const companyUpdateResultOutputSchema = z.object({
  company_id: z.number().int(),
});

// ---------------------------------------------------------------------------
// Output types (inferred from schemas)
// ---------------------------------------------------------------------------

export type CompanyLinkOutput = z.output<typeof companyLinkOutputSchema>;
export type CompanyWithRelationsOutput = z.output<typeof companyWithRelationsOutputSchema>;
export type CompanyDetailTxOutput = z.output<typeof companyDetailTxOutputSchema>;
export type CompanyUpdateResultOutput = z.output<typeof companyUpdateResultOutputSchema>;
