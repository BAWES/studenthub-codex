import { describe, it, expect } from "vitest";
import {
  adminCompanySettingsItemSchema,
  adminCompanySettingsListResultSchema,
  adminCompanySettingsActionResponseSchema,
} from "../schemas";

describe("adminCompanySettingsItemSchema", () => {
  const validItem = {
    company_id: 1,
    company_name: "Acme Corp",
    company_common_name_en: "Acme",
    company_common_name_ar: "أكمة",
    company_description_en: "A company that does things",
    company_description_ar: "شركة",
    company_website: "https://acme.com",
    company_email: "info@acme.com",
    company_hourly_rate: 50,
    company_bonus_commission: 10,
    company_followup: true,
    company_followup_interval_weeks: 4,
    company_approved_to_hire: true,
    currency_code: "KWD",
  };

  it("accepts a valid item with all fields", () => {
    expect(adminCompanySettingsItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      adminCompanySettingsItemSchema.safeParse({
        ...validItem,
        company_name: null,
        company_common_name_en: null,
        company_common_name_ar: null,
        company_description_en: null,
        company_description_ar: null,
        company_website: null,
        company_email: null,
        company_hourly_rate: null,
        company_bonus_commission: null,
        company_followup: null,
        company_followup_interval_weeks: null,
        company_approved_to_hire: null,
        currency_code: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validItem;
    expect(adminCompanySettingsItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string for company_id", () => {
    expect(
      adminCompanySettingsItemSchema.safeParse({ ...validItem, company_id: "1" }).success,
    ).toBe(false);
  });
});

describe("adminCompanySettingsListResultSchema", () => {
  it("accepts non-empty items array", () => {
    expect(
      adminCompanySettingsListResultSchema.safeParse({
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
            company_hourly_rate: null,
            company_bonus_commission: null,
            company_followup: null,
            company_followup_interval_weeks: null,
            company_approved_to_hire: null,
            currency_code: null,
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(adminCompanySettingsListResultSchema.safeParse({ items: [] }).success).toBe(true);
  });

  it("rejects missing items", () => {
    expect(adminCompanySettingsListResultSchema.safeParse({}).success).toBe(false);
  });
});

describe("adminCompanySettingsActionResponseSchema", () => {
  it("accepts success with message", () => {
    expect(
      adminCompanySettingsActionResponseSchema.safeParse({
        operation: "success",
        message: "Updated successfully",
      }).success,
    ).toBe(true);
  });

  it("accepts error with message", () => {
    expect(
      adminCompanySettingsActionResponseSchema.safeParse({
        operation: "error",
        message: "Something went wrong",
      }).success,
    ).toBe(true);
  });

  it("rejects missing message", () => {
    expect(
      adminCompanySettingsActionResponseSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });

  it("rejects invalid operation", () => {
    expect(
      adminCompanySettingsActionResponseSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success,
    ).toBe(false);
  });
});
