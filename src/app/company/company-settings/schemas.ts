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
// Types
// ---------------------------------------------------------------------------

export type UpdateCompanySettingsInput = z.input<typeof updateCompanySettingsSchema>;

export type CompanySettings = {
  company_id: number;
  company_name: string | null;
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
  company_followup_interval_weeks: number | null;
  company_approved_to_hire: boolean | null;
  currency_code: string | null;
};

export type CompanySettingsActionResult = {
  operation: "success" | "error";
  message: string;
  data?: CompanySettings;
};
