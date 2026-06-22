import { z } from "zod";

export const adminCompanySettingsItemSchema = z.object({
  company_id: z.number().int().positive(),
  company_name: z.string().min(1),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_description_en: z.string().nullable(),
  company_description_ar: z.string().nullable(),
  company_website: z.string().nullable(),
  company_email: z.string().nullable(),
  company_hourly_rate: z.number().nullable(),
  company_bonus_commission: z.number().nullable(),
  company_followup: z.boolean(),
  company_followup_interval_weeks: z.number().int().nullable(),
  company_approved_to_hire: z.boolean(),
  currency_code: z.string().nullable(),
});

export const adminCompanySettingsActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string().optional(),
});

export const updateCompanySettingsInputSchema = z.object({
  companyName: z.string().max(255).nullable().optional(),
  companyCommonNameEn: z.string().max(255).nullable().optional(),
  companyCommonNameAr: z.string().max(255).nullable().optional(),
  companyDescriptionEn: z.string().nullable().optional(),
  companyDescriptionAr: z.string().nullable().optional(),
  companyWebsite: z.string().nullable().optional(),
  companyEmail: z.string().max(225).nullable().optional(),
  companyHourlyRate: z.number().nullable().optional(),
  companyBonusCommission: z.number().nullable().optional(),
  companyFollowup: z.boolean().optional(),
  companyFollowupIntervalWeeks: z.number().int().min(1).max(52).nullable().optional(),
  companyApprovedToHire: z.boolean().optional(),
  currencyCode: z.string().max(3).nullable().optional(),
});

export type AdminCompanySettingsItem = z.output<typeof adminCompanySettingsItemSchema>;
export type AdminCompanySettingsActionResponse = z.output<typeof adminCompanySettingsActionResponseSchema>;
export type UpdateCompanySettingsInput = z.input<typeof updateCompanySettingsInputSchema>;
