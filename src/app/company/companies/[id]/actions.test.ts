import { describe, it, expect } from "vitest";
import {
  getCompanyDetailSchema,
  updateCompanySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCompanyDetailSchema
// ---------------------------------------------------------------------------

describe("getCompanyDetailSchema", () => {
  it("accepts a valid company ID", () => {
    const result = getCompanyDetailSchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
    }
  });

  it("rejects zero company ID", () => {
    const result = getCompanyDetailSchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative company ID", () => {
    const result = getCompanyDetailSchema.safeParse({ companyId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing companyId", () => {
    const result = getCompanyDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-integer companyId", () => {
    const result = getCompanyDetailSchema.safeParse({ companyId: 12.5 });
    expect(result.success).toBe(false);
  });

  it("rejects string companyId", () => {
    const result = getCompanyDetailSchema.safeParse({ companyId: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanySchema
// ---------------------------------------------------------------------------

describe("updateCompanySchema", () => {
  it("accepts companyId with partial update (name only)", () => {
    const result = updateCompanySchema.safeParse({
      companyId: 1,
      company_name: "Updated Corp",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.company_name).toBe("Updated Corp");
      expect(result.data.company_email).toBeUndefined();
    }
  });

  it("accepts companyId only (no optional fields)", () => {
    const result = updateCompanySchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = updateCompanySchema.safeParse({
      companyId: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: "أكمي",
      company_description_en: "Updated description",
      company_website: "https://acme.example.com",
      company_email: "info@acme.example.com",
      commercial_licence: "LIC-99999",
      country_id: 2,
      currency_code: "USD",
      company_hourly_rate: 20.0,
      company_bonus_commission: 3.0,
      company_followup: false,
      company_approved_to_hire: false,
      company_status_override: true,
      parent_company_id: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_followup).toBe(false);
      expect(result.data.parent_company_id).toBe(5);
    }
  });

  it("rejects missing companyId", () => {
    const result = updateCompanySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero companyId", () => {
    const result = updateCompanySchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = updateCompanySchema.safeParse({
      companyId: 1,
      company_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid website URL", () => {
    const result = updateCompanySchema.safeParse({
      companyId: 1,
      company_website: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    const result = updateCompanySchema.safeParse({
      companyId: 1,
      company_hourly_rate: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects bonus commission over 100", () => {
    const result = updateCompanySchema.safeParse({
      companyId: 1,
      company_bonus_commission: 150,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("CompanyDetailResult shape", () => {
  it("defines the expected fields", () => {
    const mock: import("./schemas").CompanyDetailResult = {
      company_id: 1,
      parent_company_id: null,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: null,
      company_description_en: "A test company",
      company_description_ar: null,
      company_website: "https://acme.example.com",
      company_email: "info@acme.example.com",
      company_logo: null,
      commercial_licence: "LIC-12345",
      company_hourly_rate: 15.5,
      company_bonus_commission: null,
      company_followup: true,
      total_candidate: 42,
      no_of_active_requests: 5,
      is_request_updates_in_30_days: false,
      company_approved_to_hire: true,
      company_status_override: false,
      company_created_at: new Date("2025-01-01"),
      company_updated_at: new Date("2026-06-09"),
      last_request_datetime: new Date("2026-06-01"),
      last_payment_datetime: null,
      country_id: 1,
      currency_code: "KWD",
      country_name: "Kuwait",
      parent_company_name: null,
      staff_name: "John Doe",
    };
    expect(mock.company_id).toBe(1);
    expect(mock.company_name).toBe("Acme Corp");
    expect(mock.currency_code).toBe("KWD");
  });
});

describe("UpdateCompanyResult shape", () => {
  it("defines the expected fields", () => {
    const result: import("./schemas").UpdateCompanyResult = {
      company_id: 42,
    };
    expect(result.company_id).toBe(42);
  });
});
