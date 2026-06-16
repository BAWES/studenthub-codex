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

/**
 * Page migration test for company/companies.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("company companies page — data contract", () => {
  it("listCompaniesSchema accepts valid input", () => {
    const r = listCompaniesSchema.safeParse({
      page: 1,
      limit: 20,
      search: "Acme",
      country_id: 1,
      currency_code: "KWD",
    });
    expect(r.success).toBe(true);
  });

  it("listCompaniesSchema accepts empty input", () => {
    const r = listCompaniesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("getCompanySchema validates with companyId", () => {
    const r = getCompanySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
  });

  it("getCompanySchema rejects missing companyId", () => {
    const r = getCompanySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createCompanySchema validates with required fields", () => {
    const r = createCompanySchema.safeParse({
      company_name: "Acme Corp",
    });
    expect(r.success).toBe(true);
  });

  it("createCompanySchema accepts all optional fields", () => {
    const r = createCompanySchema.safeParse({
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: "أكمي",
      company_description_en: "A company",
      company_description_ar: "شركة",
      company_website: "https://acme.com",
      company_email: "hr@acme.com",
      commercial_licence: "LIC-123",
      country_id: 1,
      currency_code: "KWD",
      company_hourly_rate: 10.5,
      company_bonus_commission: 5,
    });
    expect(r.success).toBe(true);
  });

  it("createCompanySchema rejects missing company_name", () => {
    const r = createCompanySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createCompanySchema rejects invalid email", () => {
    const r = createCompanySchema.safeParse({
      company_name: "Acme",
      company_email: "not-an-email",
    });
    expect(r.success).toBe(false);
  });

  it("updateCompanySchema validates with companyId and optional fields", () => {
    const r = updateCompanySchema.safeParse({
      companyId: 42,
      company_name: "Updated Corp",
      company_followup: true,
      company_approved_to_hire: false,
    });
    expect(r.success).toBe(true);
  });

  it("updateCompanySchema rejects missing companyId", () => {
    const r = updateCompanySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("companyListItemSchema validates a list item", () => {
    const r = companyListItemSchema.safeParse({
      company_id: 1,
      company_name: "Acme Corp",
      company_email: "hr@acme.com",
      company_website: null,
      country_name: "Kuwait",
      country_id: 1,
      no_of_active_requests: 5,
      total_candidate: 42,
      company_updated_at: new Date("2026-06-01"),
      currency_code: "KWD",
      commercial_licence: "LIC-123",
    });
    expect(r.success).toBe(true);
  });

  it("companyListItemSchema accepts nullable fields", () => {
    const r = companyListItemSchema.safeParse({
      company_id: 1,
      company_name: "Acme",
      company_email: null,
      company_website: null,
      country_name: null,
      country_id: null,
      no_of_active_requests: null,
      total_candidate: null,
      company_updated_at: new Date(),
      currency_code: null,
      commercial_licence: null,
    });
    expect(r.success).toBe(true);
  });

  it("listCompaniesResultSchema validates paginated result", () => {
    const r = listCompaniesResultSchema.safeParse({
      companies: [
        {
          company_id: 1,
          company_name: "Acme",
          company_email: null,
          company_website: null,
          country_name: "Kuwait",
          country_id: 1,
          no_of_active_requests: 5,
          total_candidate: 42,
          company_updated_at: new Date(),
          currency_code: "KWD",
          commercial_licence: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("companyDetailSchema validates detail object", () => {
    const r = companyDetailSchema.safeParse({
      company_id: 1,
      parent_company_id: null,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: null,
      company_description_en: null,
      company_description_ar: null,
      company_website: "https://acme.com",
      company_email: "hr@acme.com",
      company_logo: null,
      commercial_licence: "LIC-123",
      company_hourly_rate: 10.5,
      company_bonus_commission: 5,
      company_followup: true,
      total_candidate: 100,
      no_of_active_requests: 3,
      is_request_updates_in_30_days: true,
      company_approved_to_hire: true,
      company_status_override: false,
      company_created_at: new Date(),
      company_updated_at: new Date(),
      last_request_datetime: new Date(),
      last_payment_datetime: null,
      country_id: 1,
      currency_code: "KWD",
      country_name: "Kuwait",
      parent_company_name: null,
      staff_name: "Staff User",
    });
    expect(r.success).toBe(true);
  });

  it("companyCreateResultSchema validates created company", () => {
    const r = companyCreateResultSchema.safeParse({ company_id: 42 });
    expect(r.success).toBe(true);
  });

  it("companyAccountRowSchema validates account row", () => {
    const r = companyAccountRowSchema.safeParse({
      id: 1,
      name: "Acme Corp",
      email: "hr@acme.com",
      country: "Kuwait",
      requests: 5,
      status: "Active",
      rate: "10.500",
      updated: "2026-06-01",
    });
    expect(r.success).toBe(true);
  });
});
