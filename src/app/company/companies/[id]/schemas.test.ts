import { describe, it, expect } from "vitest";
import {
  getCompanyDetailSchema,
  updateCompanySchema,
  companyDetailResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCompanyDetailSchema
// ---------------------------------------------------------------------------
describe("getCompanyDetailSchema", () => {
  const validInput = { companyId: 42 };

  it("accepts valid input", () => {
    expect(getCompanyDetailSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(getCompanyDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(getCompanyDetailSchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(getCompanyDetailSchema.safeParse({ companyId: -1 }).success).toBe(false);
  });

  it("rejects non-integer companyId", () => {
    expect(getCompanyDetailSchema.safeParse({ companyId: 1.5 }).success).toBe(false);
  });

  it("rejects string companyId", () => {
    expect(getCompanyDetailSchema.safeParse({ companyId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanySchema
// ---------------------------------------------------------------------------
describe("updateCompanySchema", () => {
  const validInput = { companyId: 42 };

  it("accepts valid input with only required fields", () => {
    expect(updateCompanySchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        company_name: "Acme Corp",
        company_common_name_en: "Acme",
        company_common_name_ar: "أكمي",
        company_description_en: "A company",
        company_description_ar: "شركة",
        company_website: "https://acme.com",
        company_email: "info@acme.com",
        commercial_licence: "LIC-123",
        country_id: 1,
        currency_code: "KWD",
        company_hourly_rate: 50,
        company_bonus_commission: 10,
        company_followup: true,
        company_approved_to_hire: true,
        company_status_override: false,
        parent_company_id: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts partial update with single field", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        company_name: "Updated Corp",
      }).success,
    ).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(updateCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(updateCompanySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(updateCompanySchema.safeParse({ companyId: -1 }).success).toBe(false);
  });

  it("rejects non-integer companyId", () => {
    expect(updateCompanySchema.safeParse({ companyId: 1.5 }).success).toBe(false);
  });

  it("rejects empty company_name", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 42, company_name: "" }).success,
    ).toBe(false);
  });

  it("rejects company_name exceeding max length", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        company_name: "A".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects invalid website URL", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        company_website: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        company_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects currency_code exceeding max length", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        currency_code: "ABCD",
      }).success,
    ).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        company_hourly_rate: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects bonus commission over 100", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        company_bonus_commission: 150,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer country_id", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        country_id: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive country_id", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 42,
        country_id: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyDetailResultSchema (output validation)
// ---------------------------------------------------------------------------
describe("companyDetailResultSchema", () => {
  const now = new Date("2025-01-01T00:00:00Z");

  const validResult = {
    company_id: 1,
    parent_company_id: null,
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
    total_candidate: null,
    no_of_active_requests: null,
    is_request_updates_in_30_days: null,
    company_approved_to_hire: null,
    company_status_override: null,
    company_created_at: now,
    company_updated_at: now,
    last_request_datetime: null,
    last_payment_datetime: null,
    country_id: null,
    currency_code: null,
    country_name: null,
    parent_company_name: null,
    staff_name: null,
  };

  it("accepts valid result with all fields", () => {
    expect(companyDetailResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts with full data", () => {
    expect(
      companyDetailResultSchema.safeParse({
        ...validResult,
        parent_company_id: 5,
        company_name: "Big Corp",
        company_hourly_rate: 75,
        company_bonus_commission: 5,
        company_followup: true,
        total_candidate: 150,
        no_of_active_requests: 3,
        is_request_updates_in_30_days: true,
        company_approved_to_hire: true,
        company_status_override: false,
        last_request_datetime: now,
        last_payment_datetime: now,
        country_id: 1,
        currency_code: "KWD",
        country_name: "Kuwait",
        parent_company_name: "Parent Corp",
        staff_name: "John Doe",
      }).success,
    ).toBe(true);
  });

  it("accepts bigint total_candidate", () => {
    expect(
      companyDetailResultSchema.safeParse({
        ...validResult,
        total_candidate: BigInt(150),
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validResult;
    expect(companyDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer company_id", () => {
    expect(
      companyDetailResultSchema.safeParse({
        ...validResult,
        company_id: "not-a-number",
      }).success,
    ).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validResult;
    expect(companyDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_followup", () => {
    expect(
      companyDetailResultSchema.safeParse({
        ...validResult,
        company_followup: "yes",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_created_at", () => {
    expect(
      companyDetailResultSchema.safeParse({
        ...validResult,
        company_created_at: "not-a-date",
      }).success,
    ).toBe(false);
  });
});
