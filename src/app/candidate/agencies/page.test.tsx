import { describe, it, expect } from "vitest";
import {
  agencyItemOutputSchema,
  agencyActionResultOutputSchema,
  listAgenciesOutputSchema,
} from "./schemas";

describe("candidate agencies page — data contract", () => {
  it("agencyItemOutputSchema validates a valid agency item", () => {
    const r = agencyItemOutputSchema.safeParse({
      company_id: 1,
      company_name: "Test Agency",
      company_common_name_en: "Test Agency EN",
      company_common_name_ar: null,
      company_email: "test@agency.com",
      company_website: "https://agency.com",
      company_logo: null,
      commercial_licence: "LIC-123",
      total_candidate: 5,
      no_of_active_requests: 2,
      country_id: 1,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    });
    expect(r.success).toBe(true);
  });

  it("agencyItemOutputSchema rejects missing company_id", () => {
    const r = agencyItemOutputSchema.safeParse({ company_name: "Test" });
    expect(r.success).toBe(false);
  });

  it("agencyActionResultOutputSchema validates success", () => {
    const r = agencyActionResultOutputSchema.safeParse({ success: true, companyId: 42 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toHaveProperty("companyId", 42);
  });

  it("agencyActionResultOutputSchema validates failure", () => {
    const r = agencyActionResultOutputSchema.safeParse({ success: false, error: "Not found" });
    expect(r.success).toBe(true);
  });

  it("agencyActionResultOutputSchema rejects invalid discriminant", () => {
    const r = agencyActionResultOutputSchema.safeParse({ success: true, error: "extra" });
    expect(r.success).toBe(false);
  });

  it("listAgenciesOutputSchema validates paginated list", () => {
    const r = listAgenciesOutputSchema.safeParse({
      items: [{
        company_id: 1, company_name: "A", company_common_name_en: null,
        company_common_name_ar: null, company_email: null, company_website: null,
        company_logo: null, commercial_licence: null, total_candidate: null,
        no_of_active_requests: null, country_id: null,
        company_created_at: null, company_updated_at: null,
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.items.length).toBe(1);
  });

  it("listAgenciesOutputSchema rejects non-array items", () => {
    const r = listAgenciesOutputSchema.safeParse({ items: "bad", total: 0, page: 1, limit: 20, totalPages: 0 });
    expect(r.success).toBe(false);
  });
});
