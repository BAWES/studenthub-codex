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
  companyAccountDetailOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validCompanyListItem = () => ({
  company_id: 1,
  company_name: "Acme Corp",
  company_email: "contact@acme.com",
  company_website: "https://acme.com",
  country_name: "Kuwait",
  country_id: 1,
  no_of_active_requests: 5,
  total_candidate: BigInt(42),
  company_updated_at: new Date("2026-06-10"),
  currency_code: "KWD",
  commercial_licence: "LIC-12345",
});

const validCompanyListItemMinimal = () => ({
  company_id: 1,
  company_name: "Acme Corp",
  company_email: null,
  company_website: null,
  country_name: null,
  country_id: null,
  no_of_active_requests: null,
  total_candidate: null,
  company_updated_at: new Date("2026-06-10"),
  currency_code: null,
  commercial_licence: null,
});

const validCompanyDetail = () => ({
  company_id: 1,
  parent_company_id: null,
  company_name: "Acme Corp",
  company_common_name_en: "Acme",
  company_common_name_ar: null,
  company_description_en: "A great company",
  company_description_ar: null,
  company_website: "https://acme.com",
  company_email: "contact@acme.com",
  company_logo: "https://cdn.example.com/logo.png",
  commercial_licence: "LIC-12345",
  company_hourly_rate: 50.0,
  company_bonus_commission: 10.0,
  company_followup: true,
  total_candidate: BigInt(42),
  no_of_active_requests: 5,
  is_request_updates_in_30_days: false,
  company_approved_to_hire: true,
  company_status_override: false,
  company_created_at: new Date("2025-01-01"),
  company_updated_at: new Date("2026-06-10"),
  last_request_datetime: new Date("2026-06-01"),
  last_payment_datetime: null,
  country_id: 1,
  currency_code: "KWD",
  country_name: "Kuwait",
  parent_company_name: null,
  staff_name: "John Staff",
});

const validCompanyDetailMinimal = () => ({
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
  company_created_at: new Date("2025-01-01"),
  company_updated_at: new Date("2026-06-10"),
  last_request_datetime: null,
  last_payment_datetime: null,
  country_id: null,
  currency_code: null,
  country_name: null,
  parent_company_name: null,
  staff_name: null,
});

const validCompanyAccountRow = () => ({
  id: 1,
  name: "Acme Corp",
  email: "contact@acme.com",
  country: "Kuwait",
  requests: 5,
  status: "active",
  rate: "50 KWD/hr",
  updated: "2 hours ago",
});

const validAccountDetailEntry = (overrides = {}) => ({
  id: "1",
  title: "Sample",
  subtitle: "Sample subtitle",
  meta: "Meta info",
  ...overrides,
});

// ---------------------------------------------------------------------------
// companyListItemSchema
// ---------------------------------------------------------------------------

describe("companyListItemSchema", () => {
  it("accepts a full company list item", () => {
    const r = companyListItemSchema.safeParse(validCompanyListItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal item with null fields", () => {
    const r = companyListItemSchema.safeParse(validCompanyListItemMinimal());
    expect(r.success).toBe(true);
  });

  it("accepts total_candidate as a number instead of BigInt", () => {
    const r = companyListItemSchema.safeParse({
      ...validCompanyListItem(),
      total_candidate: 42,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = companyListItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects missing company_id", () => {
    const r = companyListItemSchema.safeParse({
      ...validCompanyListItem(),
      company_id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const r = companyListItemSchema.safeParse({
      ...validCompanyListItem(),
      company_name: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    const r = companyListItemSchema.safeParse({
      ...validCompanyListItem(),
      company_id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_updated_at (string instead of Date)", () => {
    const r = companyListItemSchema.safeParse({
      ...validCompanyListItem(),
      company_updated_at: "2026-06-10",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompaniesResultSchema
// ---------------------------------------------------------------------------

describe("listCompaniesResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listCompaniesResultSchema.safeParse({
      companies: [validCompanyListItem(), validCompanyListItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty companies array", () => {
    const r = listCompaniesResultSchema.safeParse({
      companies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing companies field", () => {
    const r = listCompaniesResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listCompaniesResultSchema.safeParse({ companies: [] });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyDetailSchema
// ---------------------------------------------------------------------------

describe("companyDetailSchema", () => {
  it("accepts a full company detail", () => {
    const r = companyDetailSchema.safeParse(validCompanyDetail());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal company detail with null fields", () => {
    const r = companyDetailSchema.safeParse(validCompanyDetailMinimal());
    expect(r.success).toBe(true);
  });

  it("accepts total_candidate as number", () => {
    const r = companyDetailSchema.safeParse({
      ...validCompanyDetail(),
      total_candidate: 99,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = companyDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects missing company_id", () => {
    const r = companyDetailSchema.safeParse({
      ...validCompanyDetail(),
      company_id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const r = companyDetailSchema.safeParse({
      ...validCompanyDetail(),
      company_name: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_followup (number instead of boolean)", () => {
    const r = companyDetailSchema.safeParse({
      ...validCompanyDetail(),
      company_followup: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_created_at (string instead of Date)", () => {
    const r = companyDetailSchema.safeParse({
      ...validCompanyDetail(),
      company_created_at: "2025-01-01",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyCreateResultSchema
// ---------------------------------------------------------------------------

describe("companyCreateResultSchema", () => {
  it("accepts a valid create result", () => {
    const r = companyCreateResultSchema.safeParse({ company_id: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing company_id", () => {
    const r = companyCreateResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-integer company_id", () => {
    const r = companyCreateResultSchema.safeParse({ company_id: 1.5 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyAccountRowSchema
// ---------------------------------------------------------------------------

describe("companyAccountRowSchema", () => {
  it("accepts a valid account row", () => {
    const r = companyAccountRowSchema.safeParse(validCompanyAccountRow());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = companyAccountRowSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects missing id", () => {
    const r = companyAccountRowSchema.safeParse({
      ...validCompanyAccountRow(),
      id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for id (string instead of number)", () => {
    const r = companyAccountRowSchema.safeParse({
      ...validCompanyAccountRow(),
      id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for requests (string instead of number)", () => {
    const r = companyAccountRowSchema.safeParse({
      ...validCompanyAccountRow(),
      requests: "five",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyAccountDetailOutputSchema
// ---------------------------------------------------------------------------

describe("companyAccountDetailOutputSchema", () => {
  it("accepts null (nullable top-level)", () => {
    const r = companyAccountDetailOutputSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("accepts a full account detail output", () => {
    const r = companyAccountDetailOutputSchema.safeParse({
      company: validCompanyDetail(),
      metrics: [
        { label: "Requests", value: 5, note: "Active requests" },
        { label: "Rate", value: "50 KWD/hr", note: "Hourly rate" },
      ],
      requests: [validAccountDetailEntry()],
      contacts: [validAccountDetailEntry()],
      stores: [
        {
          id: 1,
          title: "Store 1",
          subtitle: "Main store",
          meta: "Active",
        },
      ],
      notes: [validAccountDetailEntry()],
    });
    expect(r.success).toBe(true);
  });

  it("accepts company field as null", () => {
    const r = companyAccountDetailOutputSchema.safeParse({
      company: null,
      metrics: [],
      requests: [],
      contacts: [],
      stores: [],
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects wrong metrics type (object instead of array)", () => {
    const r = companyAccountDetailOutputSchema.safeParse({
      company: null,
      metrics: "not-an-array",
      requests: [],
      contacts: [],
      stores: [],
      notes: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required nested fields in requests", () => {
    const r = companyAccountDetailOutputSchema.safeParse({
      company: null,
      metrics: [],
      requests: [{ id: "1" }],
      contacts: [],
      stores: [],
      notes: [],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompaniesSchema (input)
// ---------------------------------------------------------------------------
describe("listCompaniesSchema", () => {
  it("accepts valid params", () => {
    const r = listCompaniesSchema.safeParse({ page: 1, limit: 20, search: "acme", country_id: 1, currency_code: "KWD" });
    expect(r.success).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    const r = listCompaniesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts partial params", () => {
    const r = listCompaniesSchema.safeParse({ page: 2, search: "test" });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields (optional -> undefined is fine)", () => {
    const r = listCompaniesSchema.safeParse({ page: 1, limit: undefined, search: undefined });
    expect(r.success).toBe(true);
  });

  it("rejects zero page", () => {
    const r = listCompaniesSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listCompaniesSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listCompaniesSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const r = listCompaniesSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const r = listCompaniesSchema.safeParse({ page: 1.5 });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for search", () => {
    const r = listCompaniesSchema.safeParse({ search: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects search exceeding max length", () => {
    const r = listCompaniesSchema.safeParse({ search: "a".repeat(256) });
    expect(r.success).toBe(false);
  });

  it("rejects empty search string", () => {
    const r = listCompaniesSchema.safeParse({ search: "" });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for country_id (string)", () => {
    const r = listCompaniesSchema.safeParse({ country_id: "one" });
    expect(r.success).toBe(false);
  });

  it("rejects currency_code exceeding max length", () => {
    const r = listCompaniesSchema.safeParse({ currency_code: "ABCD" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanySchema (input)
// ---------------------------------------------------------------------------
describe("getCompanySchema", () => {
  it("accepts a valid company ID", () => {
    const r = getCompanySchema.safeParse({ companyId: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const r = getCompanySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-positive ID", () => {
    const r = getCompanySchema.safeParse({ companyId: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative ID", () => {
    const r = getCompanySchema.safeParse({ companyId: -5 });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type (string instead of number)", () => {
    const r = getCompanySchema.safeParse({ companyId: "not-a-number" });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer (float)", () => {
    const r = getCompanySchema.safeParse({ companyId: 1.5 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanySchema (input)
// ---------------------------------------------------------------------------
describe("createCompanySchema", () => {
  const valid = {
    company_name: "Acme Corp",
    company_common_name_en: "Acme",
    company_common_name_ar: "أكمه",
    company_description_en: "A great company",
    company_description_ar: "شركة رائعة",
    company_website: "https://acme.com",
    company_email: "contact@acme.com",
    commercial_licence: "LIC-12345",
    country_id: 1,
    currency_code: "KWD",
    company_hourly_rate: 50.0,
    company_bonus_commission: 10.0,
  };

  it("accepts valid input with all fields", () => {
    const r = createCompanySchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("accepts minimal input (only required fields)", () => {
    const r = createCompanySchema.safeParse({ company_name: "Minimal Corp" });
    expect(r.success).toBe(true);
  });

  it("accepts optional fields omitting company_common_name_en", () => {
    const { company_common_name_en: _, ...without } = valid;
    const r = createCompanySchema.safeParse(without);
    expect(r.success).toBe(true);
  });

  it("rejects missing company_name", () => {
    const r = createCompanySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects empty company_name", () => {
    const r = createCompanySchema.safeParse({ company_name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects company_name exceeding max length", () => {
    const r = createCompanySchema.safeParse({ company_name: "a".repeat(256) });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_name", () => {
    const r = createCompanySchema.safeParse({ company_name: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects invalid URL for company_website", () => {
    const r = createCompanySchema.safeParse({ ...valid, company_website: "not-a-url" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email for company_email", () => {
    const r = createCompanySchema.safeParse({ ...valid, company_email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive hourly rate", () => {
    const r = createCompanySchema.safeParse({ ...valid, company_hourly_rate: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects commission below 0", () => {
    const r = createCompanySchema.safeParse({ ...valid, company_bonus_commission: -5 });
    expect(r.success).toBe(false);
  });

  it("rejects commission above 100", () => {
    const r = createCompanySchema.safeParse({ ...valid, company_bonus_commission: 150 });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for country_id (string)", () => {
    const r = createCompanySchema.safeParse({ ...valid, country_id: "one" });
    expect(r.success).toBe(false);
  });

  it("rejects currency_code exceeding max length", () => {
    const r = createCompanySchema.safeParse({ ...valid, currency_code: "ABCD" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanySchema (input)
// ---------------------------------------------------------------------------
describe("updateCompanySchema", () => {
  it("accepts valid update with all fields", () => {
    const r = updateCompanySchema.safeParse({
      companyId: 1,
      company_name: "Updated Corp",
      company_common_name_en: "Updated",
      company_common_name_ar: "محدث",
      company_description_en: "Updated description",
      company_description_ar: "وصف محدث",
      company_website: "https://updated.com",
      company_email: "updated@acme.com",
      commercial_licence: "LIC-99999",
      country_id: 2,
      currency_code: "USD",
      company_hourly_rate: 75.0,
      company_bonus_commission: 15.0,
      company_followup: true,
      company_approved_to_hire: false,
      company_status_override: true,
      parent_company_id: 10,
    });
    expect(r.success).toBe(true);
  });

  it("accepts update with only companyId (all optional fields)", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1 });
    expect(r.success).toBe(true);
  });

  it("accepts update omitting all optional fields", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const r = updateCompanySchema.safeParse({ company_name: "Test" });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive companyId", () => {
    const r = updateCompanySchema.safeParse({ companyId: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative companyId", () => {
    const r = updateCompanySchema.safeParse({ companyId: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for companyId", () => {
    const r = updateCompanySchema.safeParse({ companyId: "not-a-number" });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer companyId", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1.5 });
    expect(r.success).toBe(false);
  });

  it("rejects empty company_name when provided", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1, company_name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid URL for company_website", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1, company_website: "not-a-url" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email for company_email", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1, company_email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive hourly rate", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1, company_hourly_rate: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects commission above 100", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1, company_bonus_commission: 101 });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_followup (number instead of boolean)", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1, company_followup: 1 });
    expect(r.success).toBe(false);
  });

  it("rejects currency_code exceeding max length", () => {
    const r = updateCompanySchema.safeParse({ companyId: 1, currency_code: "ABCD" });
    expect(r.success).toBe(false);
  });
});
