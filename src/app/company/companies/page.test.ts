import { describe, it, expect } from "vitest";
import {
  companyListItemSchema,
  listCompaniesResultSchema,
  companyDetailSchema,
  companyCreateResultSchema,
  companyAccountRowSchema,
} from "./schemas";

describe("company companies page — data contract", () => {
  it("companyListItemSchema validates a valid company list item", () => {
    const r = companyListItemSchema.safeParse({
      company_id: 1,
      company_name: "Tech Corp",
      company_email: "info@techcorp.com",
      company_website: "https://techcorp.com",
      country_name: "Kuwait",
      country_id: 1,
      no_of_active_requests: 5,
      total_candidate: 100,
      company_updated_at: new Date("2024-06-01"),
      currency_code: "KWD",
      commercial_licence: "LIC-12345",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.company_name).toBe("Tech Corp");
  });

  it("companyListItemSchema rejects missing company_id", () => {
    const r = companyListItemSchema.safeParse({ company_name: "Tech Corp" });
    expect(r.success).toBe(false);
  });

  it("companyListItemSchema accepts null values for nullable fields", () => {
    const r = companyListItemSchema.safeParse({
      company_id: 1,
      company_name: "Tech Corp",
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

  it("listCompaniesResultSchema validates a paginated result", () => {
    const r = listCompaniesResultSchema.safeParse({
      companies: [
        {
          company_id: 1, company_name: "A", company_email: null,
          company_website: null, country_name: null, country_id: null,
          no_of_active_requests: null, total_candidate: null,
          company_updated_at: new Date(), currency_code: null,
          commercial_licence: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.companies.length).toBe(1);
  });

  it("listCompaniesResultSchema rejects non-array companies", () => {
    const r = listCompaniesResultSchema.safeParse({
      companies: "bad",
      total: 0, page: 0, limit: 0, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("companyDetailSchema validates a company detail", () => {
    const r = companyDetailSchema.safeParse({
      company_id: 1,
      parent_company_id: null,
      company_name: "Tech Corp",
      company_common_name_en: "Tech Corp EN",
      company_common_name_ar: null,
      company_description_en: "A tech company",
      company_description_ar: null,
      company_website: "https://techcorp.com",
      company_email: "info@techcorp.com",
      company_logo: null,
      commercial_licence: "LIC-12345",
      company_hourly_rate: 50,
      company_bonus_commission: 10,
      company_followup: false,
      total_candidate: 100,
      no_of_active_requests: 5,
      is_request_updates_in_30_days: true,
      company_approved_to_hire: true,
      company_status_override: false,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
      last_request_datetime: new Date("2024-05-01"),
      last_payment_datetime: null,
      country_id: 1,
      currency_code: "KWD",
      country_name: "Kuwait",
      parent_company_name: null,
      staff_name: "John Doe",
    });
    expect(r.success).toBe(true);
  });

  it("companyDetailSchema rejects missing company_id", () => {
    const r = companyDetailSchema.safeParse({ company_name: "Tech Corp" });
    expect(r.success).toBe(false);
  });

  it("companyCreateResultSchema validates creation result", () => {
    const r = companyCreateResultSchema.safeParse({ company_id: 42 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.company_id).toBe(42);
  });

  it("companyCreateResultSchema rejects missing company_id", () => {
    const r = companyCreateResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("companyAccountRowSchema validates a valid account row", () => {
    const r = companyAccountRowSchema.safeParse({
      id: 1,
      name: "Tech Corp",
      email: "info@techcorp.com",
      country: "Kuwait",
      requests: 5,
      status: "active",
      rate: "50 KWD/hr",
      updated: "2024-06-01",
    });
    expect(r.success).toBe(true);
  });

  it("companyAccountRowSchema rejects missing id", () => {
    const r = companyAccountRowSchema.safeParse({ name: "Tech Corp" });
    expect(r.success).toBe(false);
  });
});
