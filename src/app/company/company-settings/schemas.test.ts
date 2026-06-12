import { describe, it, expect } from "vitest";
import {
  updateCompanySettingsSchema,
  companySettingsOutputSchema,
  companySettingsListOutputSchema,
  companySettingsActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("updateCompanySettingsSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateCompanySettingsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts all valid fields", () => {
    const r = updateCompanySettingsSchema.safeParse({
      companyName: "Acme Corp",
      companyCommonNameEn: "Acme",
      companyCommonNameAr: "أكمة",
      companyDescriptionEn: "A company",
      companyDescriptionAr: "شركة",
      companyWebsite: "https://acme.com",
      companyEmail: "info@acme.com",
      companyHourlyRate: 50,
      companyBonusCommission: 10,
      companyFollowup: true,
      companyFollowupIntervalWeeks: 4,
      companyApprovedToHire: true,
      currencyCode: "KWD",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyName).toBe("Acme Corp");
      expect(r.data.companyHourlyRate).toBe(50);
      expect(r.data.companyFollowupIntervalWeeks).toBe(4);
    }
  });

  it("coerces numeric string fields", () => {
    const r = updateCompanySettingsSchema.safeParse({
      companyHourlyRate: "50",
      companyBonusCommission: "10",
      companyFollowupIntervalWeeks: "4",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyHourlyRate).toBe(50);
      expect(r.data.companyBonusCommission).toBe(10);
      expect(r.data.companyFollowupIntervalWeeks).toBe(4);
    }
  });

  it("coerces boolean-like values for boolean fields", () => {
    const r = updateCompanySettingsSchema.safeParse({
      companyFollowup: true,
      companyApprovedToHire: false,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyFollowup).toBe(true);
      expect(r.data.companyApprovedToHire).toBe(false);
    }
  });

  it("rejects companyName exceeding 255 chars", () => {
    expect(
      updateCompanySettingsSchema.safeParse({
        companyName: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects companyEmail exceeding 225 chars", () => {
    expect(
      updateCompanySettingsSchema.safeParse({
        companyEmail: "a".repeat(226),
      }).success,
    ).toBe(false);
  });

  it("rejects companyFollowupIntervalWeeks < 1", () => {
    expect(
      updateCompanySettingsSchema.safeParse({
        companyFollowupIntervalWeeks: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects companyFollowupIntervalWeeks > 52", () => {
    expect(
      updateCompanySettingsSchema.safeParse({
        companyFollowupIntervalWeeks: 53,
      }).success,
    ).toBe(false);
  });

  it("rejects currencyCode exceeding 3 chars", () => {
    expect(
      updateCompanySettingsSchema.safeParse({
        currencyCode: "KWDD",
      }).success,
    ).toBe(false);
  });

  it("rejects string for boolean fields without coercion", () => {
    expect(
      updateCompanySettingsSchema.safeParse({
        companyFollowup: "true",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("companySettingsOutputSchema", () => {
  const validSettings = {
    company_id: 1,
    company_name: "Acme Corp",
    company_common_name_en: "Acme",
    company_common_name_ar: null,
    company_description_en: "Description",
    company_description_ar: null,
    company_website: "https://acme.com",
    company_email: "info@acme.com",
    company_logo: "https://logo.com/logo.png",
    commercial_licence: "LIC-123",
    company_hourly_rate: 50,
    company_bonus_commission: 10,
    company_followup: true,
    company_followup_interval_weeks: 4,
    company_approved_to_hire: true,
    currency_code: "KWD",
  };

  it("accepts valid settings with all fields", () => {
    expect(
      companySettingsOutputSchema.safeParse(validSettings).success,
    ).toBe(true);
  });

  it("accepts null string fields", () => {
    expect(
      companySettingsOutputSchema.safeParse({
        ...validSettings,
        company_name: null,
        company_common_name_en: null,
        company_common_name_ar: null,
        company_description_en: null,
        company_description_ar: null,
        company_website: null,
        company_email: null,
        company_logo: null,
        commercial_licence: null,
        currency_code: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null numeric fields", () => {
    expect(
      companySettingsOutputSchema.safeParse({
        ...validSettings,
        company_hourly_rate: null,
        company_bonus_commission: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null boolean fields", () => {
    expect(
      companySettingsOutputSchema.safeParse({
        ...validSettings,
        company_followup: null,
        company_approved_to_hire: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null integer field", () => {
    expect(
      companySettingsOutputSchema.safeParse({
        ...validSettings,
        company_followup_interval_weeks: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validSettings;
    expect(companySettingsOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string for company_id", () => {
    expect(
      companySettingsOutputSchema.safeParse({
        ...validSettings,
        company_id: "1",
      }).success,
    ).toBe(false);
  });

  it("rejects float for company_id", () => {
    expect(
      companySettingsOutputSchema.safeParse({
        ...validSettings,
        company_id: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects string for company_hourly_rate", () => {
    expect(
      companySettingsOutputSchema.safeParse({
        ...validSettings,
        company_hourly_rate: "50",
      }).success,
    ).toBe(false);
  });

  it("rejects string for boolean field", () => {
    expect(
      companySettingsOutputSchema.safeParse({
        ...validSettings,
        company_followup: "true",
      }).success,
    ).toBe(false);
  });
});

describe("companySettingsListOutputSchema", () => {
  const validSettings = {
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
  };

  it("accepts non-empty items array", () => {
    expect(
      companySettingsListOutputSchema.safeParse({
        items: [validSettings],
      }).success,
    ).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      companySettingsListOutputSchema.safeParse({ items: [] }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    expect(
      companySettingsListOutputSchema.safeParse({}).success,
    ).toBe(false);
  });

  it("rejects invalid item in items array", () => {
    expect(
      companySettingsListOutputSchema.safeParse({
        items: [{ company_id: "string-instead-of-number" }],
      }).success,
    ).toBe(false);
  });
});

describe("companySettingsActionResultOutputSchema", () => {
  it("accepts success result with message and data", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "success",
      message: "Settings updated successfully",
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
    if (r.success) {
      expect(r.data.operation).toBe("success");
      expect(r.data.message).toBe("Settings updated successfully");
    }
  });

  it("accepts success result without data", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "success",
      message: "Settings updated",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result with message and data", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "error",
      message: "Failed to update settings",
      data: {
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
      },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.operation).toBe("error");
      expect(r.data.message).toBe("Failed to update settings");
    }
  });

  it("accepts error result without data", () => {
    const r = companySettingsActionResultOutputSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing message", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({
        operation: "success",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid operation value", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({
        operation: "invalid",
        message: "Something",
      }).success,
    ).toBe(false);
  });

  it("rejects mismatched discriminator field", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({
        success: true,
        message: "Test",
      }).success,
    ).toBe(false);
  });
});
