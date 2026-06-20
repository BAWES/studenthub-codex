import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas — admin view of company settings
// ---------------------------------------------------------------------------

export const adminCompanySettingsItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string().nullable(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_description_en: z.string().nullable(),
  company_description_ar: z.string().nullable(),
  company_website: z.string().nullable(),
  company_email: z.string().nullable(),
  company_hourly_rate: z.number().nullable(),
  company_bonus_commission: z.number().nullable(),
  company_followup: z.boolean().nullable(),
  company_followup_interval_weeks: z.number().int().nullable(),
  company_approved_to_hire: z.boolean().nullable(),
  currency_code: z.string().nullable(),
});

export const adminCompanySettingsListResultSchema = z.object({
  items: z.array(adminCompanySettingsItemSchema),
});

export const adminCompanySettingsActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminCompanySettingsItem = z.output<typeof adminCompanySettingsItemSchema>;
export type AdminCompanySettingsListResult = z.output<typeof adminCompanySettingsListResultSchema>;
export type AdminCompanySettingsActionResponse = z.output<typeof adminCompanySettingsActionResponseSchema>;
