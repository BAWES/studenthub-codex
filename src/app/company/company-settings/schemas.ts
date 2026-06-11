import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const updateCompanySettingsSchema = z.object({
  companyName: z.string().max(255).optional(),
  companyCommonNameEn: z.string().max(255).optional(),
  companyCommonNameAr: z.string().max(255).optional(),
  companyDescriptionEn: z.string().optional(),
  companyDescriptionAr: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyEmail: z.string().max(225).optional(),
  companyHourlyRate: z.coerce.number().optional(),
  companyBonusCommission: z.coerce.number().optional(),
  companyFollowup: z.boolean().optional(),
  companyFollowupIntervalWeeks: z.coerce.number().int().min(1).max(52).optional(),
  companyApprovedToHire: z.boolean().optional(),
  currencyCode: z.string().max(3).optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const companySettingsOutputSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string().nullable(),
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
  company_followup_interval_weeks: z.number().int().nullable(),
  company_approved_to_hire: z.boolean().nullable(),
  currency_code: z.string().nullable(),
});

export const companySettingsListOutputSchema = z.object({
  items: z.array(companySettingsOutputSchema),
});

export const companySettingsActionResultOutputSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("success"),
    message: z.string(),
    data: companySettingsOutputSchema.optional(),
  }),
  z.object({
    operation: z.literal("error"),
    message: z.string(),
    data: companySettingsOutputSchema.optional(),
  }),
]);

// ---------------------------------------------------------------------------
// Types (derived from schemas where possible, manual for async result shapes)
// ---------------------------------------------------------------------------

export type UpdateCompanySettingsInput = z.input<typeof updateCompanySettingsSchema>;

export type CompanySettings = z.output<typeof companySettingsOutputSchema>;

export type CompanySettingsActionResult = z.output<typeof companySettingsActionResultOutputSchema>;
