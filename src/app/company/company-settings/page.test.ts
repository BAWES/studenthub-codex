import { describe, it, expect } from "vitest";
import {
  companySettingsOutputSchema,
  companySettingsListOutputSchema,
  companySettingsActionResultOutputSchema,
} from "./schemas";

describe("company settings page — data contract", () => {
  it("companySettingsOutputSchema validates valid settings", () => {
    const r = companySettingsOutputSchema.safeParse({
      company_id: 1,
      company_name: "Tech Corp",
      company_common_name_en: "Tech Corp EN",
      company_common_name_ar: null,
      company_description_en: "A tech company",
      company_description_ar: null,
      company_website: "https://techcorp.com",
      company_email: "info@techcorp.com",
      company_logo: null,
      commercial_licence: "LIC-12345",
      company_hourly_rate: 50,
      company_bonus_commission: 10,
      company_followup: false,
      company_followup_interval_weeks: 4,
      company_approved_to_hire: true,
      currency_code: "KWD",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.company_name).toBe("Tech Corp");
  });

  it("companySettingsOutputSchema rejects missing company_id", () => {
    const r = companySettingsOutputSchema.safeParse({ company_name: "Tech Corp" });
    expect(r.success).toBe(false);
  });

  it("companySettingsOutputSchema accepts null for all nullable fields", () => {
    const r = companySettingsOutputSchema.safeParse({
      company_id: 1,
      company_name: null,
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
    });
    expect(r.success).toBe(true);
  });

  it("companySettingsListOutputSchema validates a list of settings", () => {
    const r = companySettingsListOutputSchema.safeParse({
      items: [
        {
          company_id: 1, company_name: "A",
          company_common_name_en: null, company_common_name_ar: null,
          company_description_en: null, company_description_ar: null,
          company_website: null, company_email: null, company_logo: null,
          commercial_licence: null, company_hourly_rate: null,
          company_bonus_commission: null, company_followup: null,
          company_followup_interval_weeks: null, company_approved_to_hire: null,
          currency_code: null,
        },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.items.length).toBe(1);
  });

  it("companySettingsActionResultOutputSchema validates success", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "success",
      message: "Settings updated",
      data: {
        company_id: 1, company_name: "Tech Corp",
        company_common_name_en: null, company_common_name_ar: null,
        company_description_en: null, company_description_ar: null,
        company_website: null, company_email: null, company_logo: null,
        commercial_licence: null, company_hourly_rate: null,
        company_bonus_commission: null, company_followup: null,
        company_followup_interval_weeks: null, company_approved_to_hire: null,
        currency_code: null,
      },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.operation).toBe("success");
  });

  it("companySettingsActionResultOutputSchema validates error", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.operation).toBe("error");
  });

  it("companySettingsActionResultOutputSchema rejects invalid operation", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "invalid",
      message: "test",
    });
    expect(r.success).toBe(false);
  });
});
