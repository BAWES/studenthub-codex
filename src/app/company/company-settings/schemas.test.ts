import { describe, it, expect } from "vitest";
import {
  updateCompanySettingsSchema,
  companySettingsOutputSchema,
  companySettingsListOutputSchema,
  companySettingsActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// updateCompanySettingsSchema
// ---------------------------------------------------------------------------
describe("updateCompanySettingsSchema", () => {
  it("accepts empty input (all optional)", () => {
    expect(updateCompanySettingsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateCompanySettingsSchema.safeParse({
        companyName: "Test Corp",
        companyEmail: "corp@example.com",
        companyHourlyRate: 50,
        companyBonusCommission: 10,
        companyFollowup: true,
        companyFollowupIntervalWeeks: 4,
        companyApprovedToHire: false,
        currencyCode: "KWD",
      }).success,
    ).toBe(true);
  });

  it("rejects companyName exceeding 255 chars", () => {
    expect(
      updateCompanySettingsSchema.safeParse({ companyName: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects companyFollowupIntervalWeeks below 1", () => {
    expect(
      updateCompanySettingsSchema.safeParse({ companyFollowupIntervalWeeks: 0 }).success,
    ).toBe(false);
  });

  it("rejects companyFollowupIntervalWeeks above 52", () => {
    expect(
      updateCompanySettingsSchema.safeParse({ companyFollowupIntervalWeeks: 53 }).success,
    ).toBe(false);
  });

  it("rejects currencyCode exceeding 3 chars", () => {
    expect(
      updateCompanySettingsSchema.safeParse({ currencyCode: "KWDD" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companySettingsOutputSchema (output)
// ---------------------------------------------------------------------------
describe("companySettingsOutputSchema", () => {
  const validOutput = {
    company_id: 1,
    company_name: "Test Corp",
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

  it("accepts a valid output", () => {
    expect(companySettingsOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("accepts non-null values", () => {
    expect(
      companySettingsOutputSchema.safeParse({ ...validOutput, company_name: "Updated", currency_code: "KWD" })
        .success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validOutput;
    expect(companySettingsOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_followup", () => {
    expect(
      companySettingsOutputSchema.safeParse({ ...validOutput, company_followup: "yes" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companySettingsListOutputSchema (output)
// ---------------------------------------------------------------------------
describe("companySettingsListOutputSchema", () => {
  const validListItem = {
    company_id: 1,
    company_name: "Test Corp",
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

  it("accepts valid output with items array", () => {
    expect(companySettingsListOutputSchema.safeParse({ items: [validListItem] }).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(companySettingsListOutputSchema.safeParse({ items: [] }).success).toBe(true);
  });

  it("rejects missing items", () => {
    expect(companySettingsListOutputSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companySettingsActionResultOutputSchema (output — discriminated union)
// ---------------------------------------------------------------------------
describe("companySettingsActionResultOutputSchema", () => {
  it("accepts success response", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({
        operation: "success",
        message: "Settings updated",
      }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({
        operation: "error",
        message: "Not found",
      }).success,
    ).toBe(true);
  });

  it("accepts response with data", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({
        operation: "success",
        message: "Updated",
        data: {
          company_id: 1,
          company_name: "Test Corp",
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
      }).success,
    ).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({ operation: "invalid", message: "Nope" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });

  // Note: message uses z.string() without min(1) — empty string allowed by schema
  it("accepts empty message (schema has no min length constraint)", () => {
    expect(
      companySettingsActionResultOutputSchema.safeParse({ operation: "success", message: "" }).success,
    ).toBe(true);
  });
});
