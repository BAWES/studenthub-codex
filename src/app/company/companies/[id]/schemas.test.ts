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
  it("accepts valid input", () => {
    expect(getCompanyDetailSchema.safeParse({ companyId: 42 }).success).toBe(true);
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
// updateCompanySchema (companies/[id])
// ---------------------------------------------------------------------------
describe("updateCompanySchema", () => {
  it("accepts valid input with only companyId", () => {
    expect(updateCompanySchema.safeParse({ companyId: 1 }).success).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 1,
        company_name: "Acme Corp",
        company_common_name_en: "Acme",
        company_common_name_ar: "أكمي",
        company_description_en: "Updated description",
        company_description_ar: "وصف محدث",
        company_website: "https://acme.com",
        company_email: "contact@acme.com",
        commercial_licence: "LIC-12345",
        country_id: 1,
        currency_code: "KWD",
        company_hourly_rate: 30,
        company_bonus_commission: 15,
        company_followup: true,
        company_approved_to_hire: false,
        company_status_override: true,
        parent_company_id: 2,
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
    expect(updateCompanySchema.safeParse({ companyId: 1, company_name: "" }).success).toBe(false);
  });

  it("rejects company_name exceeding 255 chars", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_name: "a".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects invalid URL", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_website: "bad-url" }).success,
    ).toBe(false);
  });

  it("rejects URL exceeding 2048 chars", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_website: "https://a.com/" + "x".repeat(2040) }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_email: "bad-email" }).success,
    ).toBe(false);
  });

  it("rejects email exceeding 225 chars", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_email: "a".repeat(216) + "@toolongdomain.com" }).success,
    ).toBe(false);
  });

  it("rejects non-positive country_id", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, country_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-positive company_hourly_rate", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_hourly_rate: 0 }).success,
    ).toBe(false);
  });

  it("rejects company_bonus_commission below 0", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_bonus_commission: -5 }).success,
    ).toBe(false);
  });

  it("rejects company_bonus_commission above 100", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_bonus_commission: 150 }).success,
    ).toBe(false);
  });

  it("rejects non-boolean company_followup", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_followup: "yes" }).success,
    ).toBe(false);
  });

  it("rejects non-boolean company_approved_to_hire", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_approved_to_hire: 1 }).success,
    ).toBe(false);
  });

  it("rejects non-boolean company_status_override", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_status_override: "true" }).success,
    ).toBe(false);
  });

  it("rejects non-positive parent_company_id", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, parent_company_id: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyDetailResultSchema (output validation)
// ---------------------------------------------------------------------------
describe("companyDetailResultSchema", () => {
  const validDetail = {
    company_id: 1,
    parent_company_id: null,
    company_name: "Acme Corp",
    company_common_name_en: "Acme",
    company_common_name_ar: null,
    company_description_en: "A great company",
    company_description_ar: null,
    company_website: "https://acme.com",
    company_email: "contact@acme.com",
    company_logo: null,
    commercial_licence: "LIC-12345",
    company_hourly_rate: 25.5,
    company_bonus_commission: 10,
    company_followup: true,
    total_candidate: BigInt(42),
    no_of_active_requests: 5,
    is_request_updates_in_30_days: true,
    company_approved_to_hire: true,
    company_status_override: false,
    company_created_at: new Date("2024-01-01"),
    company_updated_at: new Date("2024-06-01"),
    last_request_datetime: new Date("2024-05-15"),
    last_payment_datetime: null,
    country_id: 1,
    currency_code: "KWD",
    country_name: "Kuwait",
    parent_company_name: null,
    staff_name: "John Doe",
  };

  it("accepts valid detail", () => {
    expect(companyDetailResultSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts total_candidate as number", () => {
    expect(
      companyDetailResultSchema.safeParse({ ...validDetail, total_candidate: 42 }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      companyDetailResultSchema.safeParse({
        ...validDetail,
        parent_company_id: null,
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
        last_request_datetime: null,
        last_payment_datetime: null,
        country_id: null,
        currency_code: null,
        country_name: null,
        parent_company_name: null,
        staff_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validDetail;
    expect(companyDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validDetail;
    expect(companyDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_created_at", () => {
    const { company_created_at: _, ...rest } = validDetail;
    expect(companyDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_updated_at", () => {
    const { company_updated_at: _, ...rest } = validDetail;
    expect(companyDetailResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-boolean company_followup", () => {
    expect(
      companyDetailResultSchema.safeParse({ ...validDetail, company_followup: "yes" }).success,
    ).toBe(false);
  });

  it("rejects non-date company_created_at", () => {
    expect(
      companyDetailResultSchema.safeParse({ ...validDetail, company_created_at: "2024-01-01" }).success,
    ).toBe(false);
  });

  it("rejects string for total_candidate", () => {
    expect(
      companyDetailResultSchema.safeParse({ ...validDetail, total_candidate: "42" }).success,
    ).toBe(false);
  });

  it("rejects non-integer company_id", () => {
    expect(
      companyDetailResultSchema.safeParse({ ...validDetail, company_id: 1.5 }).success,
    ).toBe(false);
  });
});
