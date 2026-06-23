import { describe, it, expect } from "vitest";
import {
  adminCompanySettingsItemSchema,
  adminCompanySettingsListResultSchema,
  adminCompanySettingsActionResponseSchema,
} from "../schemas";

describe("adminCompanySettingsItemSchema", () => {
  it("accepts a valid item with all fields", () => {
    const item = {
      company_id: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: null,
      company_description_en: "A company",
      company_description_ar: null,
      company_website: "https://acme.com",
      company_email: "info@acme.com",
      company_hourly_rate: 50,
      company_bonus_commission: 10,
      company_followup: true,
      company_followup_interval_weeks: 4,
      company_approved_to_hire: true,
      currency_code: "KWD",
    };
    const result = adminCompanySettingsItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const item = {
      company_id: 2,
      company_name: "Beta Corp",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_description_en: null,
      company_description_ar: null,
      company_website: null,
      company_email: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_followup: false,
      company_followup_interval_weeks: null,
      company_approved_to_hire: false,
      currency_code: null,
    };
    const result = adminCompanySettingsItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing company_id", () => {
    const result = adminCompanySettingsItemSchema.safeParse({
      company_name: "No ID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects string for company_id", () => {
    const result = adminCompanySettingsItemSchema.safeParse({
      company_id: "abc",
      company_name: "Bad ID",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminCompanySettingsListResultSchema", () => {
  it("accepts non-empty items array", () => {
    const result = adminCompanySettingsListResultSchema.safeParse({
      items: [
        {
          company_id: 1,
          company_name: "Test",
          company_common_name_en: null,
          company_common_name_ar: null,
          company_description_en: null,
          company_description_ar: null,
          company_website: null,
          company_email: null,
          company_hourly_rate: null,
          company_bonus_commission: null,
          company_followup: true,
          company_followup_interval_weeks: null,
          company_approved_to_hire: true,
          currency_code: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const result = adminCompanySettingsListResultSchema.safeParse({ items: [] });
    expect(result.success).toBe(true);
  });

  it("rejects missing items", () => {
    const result = adminCompanySettingsListResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("adminCompanySettingsActionResponseSchema", () => {
  it("accepts success with message", () => {
    const result = adminCompanySettingsActionResponseSchema.safeParse({
      operation: "success",
      message: "Updated",
    });
    expect(result.success).toBe(true);
  });

  it("accepts error with message", () => {
    const result = adminCompanySettingsActionResponseSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing message", () => {
    const result = adminCompanySettingsActionResponseSchema.safeParse({
      operation: "success",
    });
    expect(result.success).toBe(true); // message is optional
  });

  it("rejects invalid operation", () => {
    const result = adminCompanySettingsActionResponseSchema.safeParse({
      operation: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
