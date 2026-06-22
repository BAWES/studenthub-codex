import { describe, it, expect } from "vitest";
import {
  updateCompanySettingsSchema,
  companySettingsOutputSchema,
  companySettingsListOutputSchema,
  companySettingsActionResultOutputSchema,
} from "./schemas";

/**
 * Page migration test for company/company-settings.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("company settings page — data contract", () => {
  it("updateCompanySettingsSchema validates all optional fields", () => {
    const r = updateCompanySettingsSchema.safeParse({
      companyName: "Acme Corp",
      companyCommonNameEn: "Acme",
      companyCommonNameAr: "أكمي",
      companyDescriptionEn: "A company",
      companyWebsite: "https://acme.com",
      companyEmail: "hr@acme.com",
      companyHourlyRate: "10.5",
      companyBonusCommission: "5",
      companyFollowup: true,
      companyFollowupIntervalWeeks: 4,
      companyApprovedToHire: true,
      currencyCode: "KWD",
    });
    expect(r.success).toBe(true);
  });

  it("updateCompanySettingsSchema accepts empty input (all optional)", () => {
    const r = updateCompanySettingsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("updateCompanySettingsSchema rejects invalid followup interval (over 52)", () => {
    const r = updateCompanySettingsSchema.safeParse({
      companyFollowupIntervalWeeks: 99,
    });
    expect(r.success).toBe(false);
  });

  it("companySettingsOutputSchema validates settings object", () => {
    const r = companySettingsOutputSchema.safeParse({
      company_id: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: null,
      company_description_en: null,
      company_description_ar: null,
      company_website: "https://acme.com",
      company_email: "hr@acme.com",
      company_logo: null,
      commercial_licence: "LIC-123",
      company_hourly_rate: 10.5,
      company_bonus_commission: 5,
      company_followup: true,
      company_followup_interval_weeks: 4,
      company_approved_to_hire: true,
      currency_code: "KWD",
    });
    expect(r.success).toBe(true);
  });

  it("companySettingsListOutputSchema validates list output", () => {
    const r = companySettingsListOutputSchema.safeParse({
      items: [
        {
          company_id: 1,
          company_name: "Acme Corp",
          company_common_name_en: null,
          company_common_name_ar: null,
          company_description_en: null,
          company_description_ar: null,
          company_website: null,
          company_email: null,
          company_logo: null,
          commercial_licence: null,
          company_hourly_rate: null,
          company_bonus_commission: null,
          company_followup: null,
          company_followup_interval_weeks: null,
          company_approved_to_hire: null,
          currency_code: null,
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("companySettingsActionResultOutputSchema validates success result", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "success",
      message: "Settings updated",
      data: {
        company_id: 1,
        company_name: "Acme Corp",
        company_common_name_en: null,
        company_common_name_ar: null,
        company_description_en: null,
        company_description_ar: null,
        company_website: null,
        company_email: null,
        company_logo: null,
        commercial_licence: null,
        company_hourly_rate: null,
        company_bonus_commission: null,
        company_followup: null,
        company_followup_interval_weeks: null,
        company_approved_to_hire: null,
        currency_code: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("companySettingsActionResultOutputSchema validates error result", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "error",
      message: "Failed to update settings",
    });
    expect(r.success).toBe(true);
  });

  it("companySettingsActionResultOutputSchema rejects invalid operation", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "invalid",
      message: "test",
    });
    expect(r.success).toBe(false);
  });
});
