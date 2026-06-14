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
  it("accepts empty input", () => {
    expect(listCompaniesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listCompaniesSchema.safeParse({ page: 1, limit: 50, search: "test corp" }).success,
    ).toBe(true);
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

  it("rejects wrong type for page", () => {
    expect(listCompaniesSchema.safeParse({ page: "abc" }).success).toBe(false);
  });

  it("rejects search exceeding 255 chars", () => {
    expect(listCompaniesSchema.safeParse({ search: "x".repeat(256) }).success).toBe(false);
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

  it("rejects wrong type", () => {
    expect(getCompanySchema.safeParse({ companyId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanySchema
// ---------------------------------------------------------------------------
describe("createCompanySchema", () => {
  const valid = {
    company_name: "Test Corp",
  };

  it("accepts minimal valid input", () => {
    expect(createCompanySchema.safeParse(valid).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      createCompanySchema.safeParse({
        ...valid,
        company_common_name_en: "TestCo",
        company_website: "https://example.com",
        company_email: "contact@example.com",
        country_id: 1,
        currency_code: "KWD",
        company_hourly_rate: 50,
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
    expect(createCompanySchema.safeParse({ company_name: "x".repeat(256) }).success).toBe(false);
  });

  it("rejects invalid URL", () => {
    expect(
      createCompanySchema.safeParse({ ...valid, company_website: "not-a-url" }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createCompanySchema.safeParse({ ...valid, company_email: "not-an-email" }).success,
    ).toBe(false);
  });

  it("rejects negative company_hourly_rate", () => {
    expect(
      createCompanySchema.safeParse({ ...valid, company_hourly_rate: -1 }).success,
    ).toBe(false);
  });

  it("rejects company_bonus_commission above 100", () => {
    expect(
      createCompanySchema.safeParse({ ...valid, company_bonus_commission: 101 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanySchema
// ---------------------------------------------------------------------------
describe("updateCompanySchema", () => {
  it("accepts minimal input (just companyId)", () => {
    expect(updateCompanySchema.safeParse({ companyId: 1 }).success).toBe(true);
  });

  it("accepts partial update with optional fields", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 1, company_name: "Updated Corp" }).success,
    ).toBe(true);
  });

  it("accepts boolean fields", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 1,
        company_followup: true,
        company_approved_to_hire: false,
      }).success,
    ).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(updateCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(updateCompanySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyListItemSchema (output)
// ---------------------------------------------------------------------------
describe("companyListItemSchema", () => {
  const validItem = {
    company_id: 1,
    company_name: "Test Corp",
    company_email: null,
    company_website: null,
    country_name: null,
    country_id: null,
    no_of_active_requests: null,
    total_candidate: null,
    company_updated_at: new Date(),
    currency_code: null,
    commercial_licence: null,
  };

  it("accepts a valid company list item", () => {
    expect(companyListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(companyListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts non-null values", () => {
    expect(
      companyListItemSchema.safeParse({
        ...validItem,
        company_email: "test@example.com",
        total_candidate: 42,
        country_name: "Kuwait",
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validItem;
    expect(companyListItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompaniesResultSchema (output)
// ---------------------------------------------------------------------------
describe("listCompaniesResultSchema", () => {
  const validResult = {
    companies: [
      {
        company_id: 1,
        company_name: "Test Corp",
        company_email: null,
        company_website: null,
        country_name: null,
        country_id: null,
        no_of_active_requests: null,
        total_candidate: null,
        company_updated_at: new Date(),
        currency_code: null,
        commercial_licence: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
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

  // Note: total uses plain z.number() without nonnegative() — allowed by schema
  it("accepts negative total (schema has no nonnegative constraint)", () => {
    expect(listCompaniesResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(true);
  });

  // Note: page uses plain z.number() without positive() — allowed by schema
  it("accepts zero page (schema has no positive constraint)", () => {
    expect(listCompaniesResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// companyDetailSchema (output)
// ---------------------------------------------------------------------------
describe("companyDetailSchema", () => {
  const validDetail = {
    company_id: 1,
    parent_company_id: null,
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
    total_candidate: null,
    no_of_active_requests: null,
    is_request_updates_in_30_days: null,
    company_approved_to_hire: null,
    company_status_override: null,
    company_created_at: new Date(),
    company_updated_at: new Date(),
    last_request_datetime: null,
    last_payment_datetime: null,
    country_id: null,
    currency_code: null,
    country_name: null,
    parent_company_name: null,
    staff_name: null,
  };

  it("accepts a valid company detail", () => {
    expect(companyDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validDetail;
    expect(companyDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyCreateResultSchema (output)
// ---------------------------------------------------------------------------
describe("companyCreateResultSchema", () => {
  it("accepts valid result", () => {
    expect(companyCreateResultSchema.safeParse({ company_id: 1 }).success).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(companyCreateResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyAccountRowSchema (output)
// ---------------------------------------------------------------------------
describe("companyAccountRowSchema", () => {
  const validRow = {
    id: 1,
    name: "Test Corp",
    email: "corp@example.com",
    country: "Kuwait",
    requests: 5,
    status: "active",
    rate: "50.000",
    updated: "2024-01-01",
  };

  it("accepts a valid row", () => {
    expect(companyAccountRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validRow;
    expect(companyAccountRowSchema.safeParse(rest).success).toBe(false);
  });
});
