import { describe, it, expect } from "vitest";
import {
  listCompaniesSchema,
  getCompanySchema,
  createCompanySchema,
  updateCompanySchema,
  companyListItemSchema,
  listCompaniesResultSchema,
  companyDetailSchema,
  companyCreateResultSchema,
  companyAccountRowSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCompaniesSchema
// ---------------------------------------------------------------------------
describe("listCompaniesSchema", () => {
  it("accepts empty input (all optional)", () => {
    expect(listCompaniesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts all fields with valid values", () => {
    expect(
      listCompaniesSchema.safeParse({
        page: 1,
        limit: 50,
        search: "acme",
        country_id: 10,
        currency_code: "KWD",
      }).success,
    ).toBe(true);
  });

  it("accepts partial fields", () => {
    expect(listCompaniesSchema.safeParse({ page: 2 }).success).toBe(true);
    expect(listCompaniesSchema.safeParse({ limit: 25 }).success).toBe(true);
    expect(listCompaniesSchema.safeParse({ search: "test" }).success).toBe(true);
  });

  it("rejects zero page", () => {
    expect(listCompaniesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCompaniesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listCompaniesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCompaniesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(listCompaniesSchema.safeParse({ page: 1.5 }).success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(listCompaniesSchema.safeParse({ limit: 10.5 }).success).toBe(false);
  });

  it("rejects non-positive country_id", () => {
    expect(listCompaniesSchema.safeParse({ country_id: 0 }).success).toBe(false);
    expect(listCompaniesSchema.safeParse({ country_id: -5 }).success).toBe(false);
  });

  it("rejects empty search string", () => {
    expect(listCompaniesSchema.safeParse({ search: "" }).success).toBe(false);
  });

  it("rejects search exceeding 255 chars", () => {
    expect(listCompaniesSchema.safeParse({ search: "a".repeat(256) }).success).toBe(false);
  });

  it("rejects currency_code exceeding 3 chars", () => {
    expect(listCompaniesSchema.safeParse({ currency_code: "KWDD" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanySchema
// ---------------------------------------------------------------------------
describe("getCompanySchema", () => {
  it("accepts valid input", () => {
    expect(getCompanySchema.safeParse({ companyId: 42 }).success).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(getCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(getCompanySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(getCompanySchema.safeParse({ companyId: -1 }).success).toBe(false);
  });

  it("rejects non-integer companyId", () => {
    expect(getCompanySchema.safeParse({ companyId: 1.5 }).success).toBe(false);
  });

  it("rejects string companyId", () => {
    expect(getCompanySchema.safeParse({ companyId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanySchema
// ---------------------------------------------------------------------------
describe("createCompanySchema", () => {
  it("accepts valid input with only required fields", () => {
    expect(
      createCompanySchema.safeParse({ company_name: "Acme Corp" }).success,
    ).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme Corp",
        company_common_name_en: "Acme",
        company_common_name_ar: "أكمي",
        company_description_en: "A great company",
        company_description_ar: "شركة رائعة",
        company_website: "https://acme.com",
        company_email: "contact@acme.com",
        commercial_licence: "LIC-12345",
        country_id: 1,
        currency_code: "KWD",
        company_hourly_rate: 25.5,
        company_bonus_commission: 10,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_name", () => {
    expect(createCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty company_name", () => {
    expect(createCompanySchema.safeParse({ company_name: "" }).success).toBe(false);
  });

  it("rejects company_name exceeding 255 chars", () => {
    expect(createCompanySchema.safeParse({ company_name: "a".repeat(256) }).success).toBe(false);
  });

  it("rejects invalid company_website URL", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_website: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid company_email", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects company_email exceeding 225 chars", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_email: "a".repeat(216) + "@toolongdomain.com",
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive country_id", () => {
    expect(
      createCompanySchema.safeParse({ company_name: "Acme", country_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-positive company_hourly_rate", () => {
    expect(
      createCompanySchema.safeParse({ company_name: "Acme", company_hourly_rate: -1 }).success,
    ).toBe(false);
  });

  it("rejects company_bonus_commission below 0", () => {
    expect(
      createCompanySchema.safeParse({ company_name: "Acme", company_bonus_commission: -1 }).success,
    ).toBe(false);
  });

  it("rejects company_bonus_commission above 100", () => {
    expect(
      createCompanySchema.safeParse({ company_name: "Acme", company_bonus_commission: 101 }).success,
    ).toBe(false);
  });

  it("rejects currency_code exceeding 3 chars", () => {
    expect(
      createCompanySchema.safeParse({ company_name: "Acme", currency_code: "KWDD" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanySchema
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

  it("rejects invalid email", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_email: "bad-email" }).success,
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
// companyListItemSchema (output validation)
// ---------------------------------------------------------------------------
describe("companyListItemSchema", () => {
  const validItem = {
    company_id: 1,
    company_name: "Acme Corp",
    company_email: "contact@acme.com",
    company_website: "https://acme.com",
    country_name: "Kuwait",
    country_id: 1,
    no_of_active_requests: 5,
    total_candidate: BigInt(10),
    company_updated_at: new Date("2024-06-01"),
    currency_code: "KWD",
    commercial_licence: "LIC-12345",
  };

  it("accepts valid item", () => {
    expect(companyListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      companyListItemSchema.safeParse({
        ...validItem,
        company_email: null,
        company_website: null,
        country_name: null,
        country_id: null,
        no_of_active_requests: null,
        total_candidate: null,
        currency_code: null,
        commercial_licence: null,
      }).success,
    ).toBe(true);
  });

  it("accepts total_candidate as number", () => {
    expect(
      companyListItemSchema.safeParse({ ...validItem, total_candidate: 10 }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validItem;
    expect(companyListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validItem;
    expect(companyListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_updated_at", () => {
    const { company_updated_at: _, ...rest } = validItem;
    expect(companyListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer company_id", () => {
    expect(
      companyListItemSchema.safeParse({ ...validItem, company_id: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects string for no_of_active_requests", () => {
    expect(
      companyListItemSchema.safeParse({ ...validItem, no_of_active_requests: "5" }).success,
    ).toBe(false);
  });

  it("rejects string for total_candidate", () => {
    expect(
      companyListItemSchema.safeParse({ ...validItem, total_candidate: "10" }).success,
    ).toBe(false);
  });

  it("rejects non-date company_updated_at", () => {
    expect(
      companyListItemSchema.safeParse({ ...validItem, company_updated_at: "2024-06-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompaniesResultSchema (output validation)
// ---------------------------------------------------------------------------
describe("listCompaniesResultSchema", () => {
  const validResult = {
    companies: [
      {
        company_id: 1,
        company_name: "Acme Corp",
        company_email: "contact@acme.com",
        company_website: "https://acme.com",
        country_name: "Kuwait",
        country_id: 1,
        no_of_active_requests: 5,
        total_candidate: BigInt(10),
        company_updated_at: new Date("2024-06-01"),
        currency_code: "KWD",
        commercial_licence: "LIC-12345",
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(listCompaniesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty companies array", () => {
    expect(
      listCompaniesResultSchema.safeParse({ ...validResult, companies: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing companies", () => {
    const { companies: _, ...rest } = validResult;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validResult;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validResult;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array companies", () => {
    expect(
      listCompaniesResultSchema.safeParse({ ...validResult, companies: "not-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyDetailSchema (output validation)
// ---------------------------------------------------------------------------
describe("companyDetailSchema", () => {
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
    expect(companyDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts total_candidate as number", () => {
    expect(
      companyDetailSchema.safeParse({ ...validDetail, total_candidate: 42 }).success,
    ).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      companyDetailSchema.safeParse({
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
    expect(companyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validDetail;
    expect(companyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_created_at", () => {
    const { company_created_at: _, ...rest } = validDetail;
    expect(companyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_updated_at", () => {
    const { company_updated_at: _, ...rest } = validDetail;
    expect(companyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-boolean company_followup", () => {
    expect(
      companyDetailSchema.safeParse({ ...validDetail, company_followup: "yes" }).success,
    ).toBe(false);
  });

  it("rejects non-date company_created_at", () => {
    expect(
      companyDetailSchema.safeParse({ ...validDetail, company_created_at: "2024-01-01" }).success,
    ).toBe(false);
  });

  it("rejects string for total_candidate", () => {
    expect(
      companyDetailSchema.safeParse({ ...validDetail, total_candidate: "42" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyCreateResultSchema (output validation)
// ---------------------------------------------------------------------------
describe("companyCreateResultSchema", () => {
  it("accepts valid result", () => {
    expect(companyCreateResultSchema.safeParse({ company_id: 1 }).success).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(companyCreateResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-integer company_id", () => {
    expect(companyCreateResultSchema.safeParse({ company_id: 1.5 }).success).toBe(false);
  });

  it("rejects string company_id", () => {
    expect(companyCreateResultSchema.safeParse({ company_id: "1" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyAccountRowSchema (output validation)
// ---------------------------------------------------------------------------
describe("companyAccountRowSchema", () => {
  const validRow = {
    id: 1,
    name: "Acme Corp",
    email: "contact@acme.com",
    country: "Kuwait",
    requests: 5,
    status: "active",
    rate: "★★★★☆",
    updated: "2024-06-01",
  };

  it("accepts valid row", () => {
    expect(companyAccountRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing country", () => {
    const { country: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing rate", () => {
    const { rate: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing updated", () => {
    const { updated: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(companyAccountRowSchema.safeParse({ ...validRow, id: 1.5 }).success).toBe(false);
  });

  it("rejects non-number requests", () => {
    expect(companyAccountRowSchema.safeParse({ ...validRow, requests: "5" }).success).toBe(false);
  });
});
