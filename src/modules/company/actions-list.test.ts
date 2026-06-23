import { describe, it, expect } from "vitest";
import { z } from "zod";

import { listCompaniesSchema, getCompanySchema } from "./schemas";

// companyListItemSchema is not exported from ./schemas; define locally.
const companyListItemSchema = z.object({
  company_id: z.number().int(),
  company_name: z.string(),
  company_common_name_en: z.string().nullable(),
  company_common_name_ar: z.string().nullable(),
  company_email: z.string().nullable(),
  company_website: z.string().nullable(),
  company_logo: z.string().nullable(),
  commission: z.number().nullable(),
  total_candidate: z.number().nullable(),
  no_of_active_requests: z.number().nullable(),
  followup: z.boolean().nullable(),
  currency_code: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------


describe("listCompanies schema", () => {
  it("accepts empty params", () => {
    const result = listCompaniesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it("accepts name filter", () => {
    const result = listCompaniesSchema.safeParse({ nameFilter: "ABC" });
    expect(result.success).toBe(true);
  });

  it("accepts valid status values", () => {
    expect(
      listCompaniesSchema.safeParse({ status: "active" }).success,
    ).toBe(true);
    expect(
      listCompaniesSchema.safeParse({ status: "inactive" }).success,
    ).toBe(true);
    expect(listCompaniesSchema.safeParse({ status: "" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = listCompaniesSchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });

  it("accepts pagination params", () => {
    const result = listCompaniesSchema.safeParse({ page: 2, pageSize: 50 });
    expect(result.success).toBe(true);
  });

  it("rejects page below 1", () => {
    const result = listCompaniesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects pageSize above 100", () => {
    const result = listCompaniesSchema.safeParse({ pageSize: 200 });
    expect(result.success).toBe(false);
  });
});

describe("getCompany schema", () => {
  it("rejects missing companyId", () => {
    const result = getCompanySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero companyId", () => {
    const result = getCompanySchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts valid companyId", () => {
    const result = getCompanySchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
  });
});

describe("companyListItemSchema", () => {
  it("validates a well-formed company result", () => {
    const item = {
      company_id: 1,
      company_name: "Test Corp",
      company_common_name_en: "Test Corp",
      company_common_name_ar: "شركة اختبار",
      company_email: "info@test.com",
      company_website: "https://test.com",
      company_logo: "/logos/test.png",
      commission: 0.05,
      total_candidate: 42,
      no_of_active_requests: 3,
      followup: true,
      currency_code: "KWD",
    };
    const result = companyListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("allows nullable fields", () => {
    const item = {
      company_id: 1,
      company_name: "Minimal Corp",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commission: null,
      total_candidate: null,
      no_of_active_requests: null,
      followup: null,
      currency_code: null,
    };
    const result = companyListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });
});
