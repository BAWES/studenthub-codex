import { describe, it, expect } from "vitest";
import {
  listCompaniesSchema,
  getCompanySchema,
  createCompanySchema,
  updateCompanySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCompaniesSchema
// ---------------------------------------------------------------------------

describe("listCompaniesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listCompaniesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBeUndefined();
      expect(result.data.limit).toBeUndefined();
      expect(result.data.search).toBeUndefined();
    }
  });

  it("accepts pagination params", () => {
    const result = listCompaniesSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts search filter", () => {
    const result = listCompaniesSchema.safeParse({ search: "Acme Corp" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("Acme Corp");
    }
  });

  it("accepts country_id filter", () => {
    const result = listCompaniesSchema.safeParse({ country_id: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country_id).toBe(1);
    }
  });

  it("accepts currency_code filter", () => {
    const result = listCompaniesSchema.safeParse({ currency_code: "KWD" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency_code).toBe("KWD");
    }
  });

  it("rejects limit over 100", () => {
    const result = listCompaniesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCompaniesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects empty search string", () => {
    const result = listCompaniesSchema.safeParse({ search: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanySchema
// ---------------------------------------------------------------------------

describe("getCompanySchema", () => {
  it("accepts a valid company ID", () => {
    const result = getCompanySchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
    }
  });

  it("rejects zero ID", () => {
    const result = getCompanySchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative ID", () => {
    const result = getCompanySchema.safeParse({ companyId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing companyId", () => {
    const result = getCompanySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanySchema
// ---------------------------------------------------------------------------

describe("createCompanySchema", () => {
  it("accepts valid minimal params (name only)", () => {
    const result = createCompanySchema.safeParse({
      company_name: "Acme Corp",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_name).toBe("Acme Corp");
      expect(result.data.company_email).toBeUndefined();
      expect(result.data.country_id).toBeUndefined();
    }
  });

  it("accepts all optional fields", () => {
    const result = createCompanySchema.safeParse({
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: "أكمي",
      company_description_en: "A test company",
      company_website: "https://acme.example.com",
      company_email: "info@acme.example.com",
      commercial_licence: "LIC-12345",
      country_id: 1,
      currency_code: "KWD",
      company_hourly_rate: 15.5,
      company_bonus_commission: 5.0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_name).toBe("Acme Corp");
      expect(result.data.company_email).toBe("info@acme.example.com");
      expect(result.data.currency_code).toBe("KWD");
      expect(result.data.company_hourly_rate).toBe(15.5);
    }
  });

  it("rejects empty company_name", () => {
    const result = createCompanySchema.safeParse({ company_name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const result = createCompanySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createCompanySchema.safeParse({
      company_name: "Acme Corp",
      company_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid website URL", () => {
    const result = createCompanySchema.safeParse({
      company_name: "Acme Corp",
      company_website: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    const result = createCompanySchema.safeParse({
      company_name: "Acme Corp",
      company_hourly_rate: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects bonus commission over 100", () => {
    const result = createCompanySchema.safeParse({
      company_name: "Acme Corp",
      company_bonus_commission: 150,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanySchema
// ---------------------------------------------------------------------------

describe("updateCompanySchema", () => {
  it("accepts valid companyId with partial update (name only)", () => {
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
      expect(result.data.company_name).toBe("Acme Corp");
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

describe("CompanyListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: import("./schemas").CompanyListItem = {
      company_id: 1,
      company_name: "Acme Corp",
      company_email: "info@acme.example.com",
      company_website: "https://acme.example.com",
      country_name: "Kuwait",
      country_id: 1,
      no_of_active_requests: 5,
      total_candidate: 42,
      company_updated_at: new Date("2026-06-09"),
      currency_code: "KWD",
      commercial_licence: "LIC-12345",
    };
    expect(mock.company_id).toBe(1);
    expect(mock.company_name).toBe("Acme Corp");
    expect(mock.country_name).toBe("Kuwait");
    expect(mock.no_of_active_requests).toBe(5);
  });
});

describe("ListCompaniesResult shape", () => {
  it("accepts a valid result set with empty list", () => {
    const result: import("./schemas").ListCompaniesResult = {
      companies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.companies).toHaveLength(0);
  });

  it("accepts a valid result set with items", () => {
    const result: import("./schemas").ListCompaniesResult = {
      companies: [
        {
          company_id: 1,
          company_name: "Acme Corp",
          company_email: null,
          company_website: null,
          country_name: null,
          country_id: null,
          no_of_active_requests: null,
          total_candidate: null,
          company_updated_at: new Date(),
          currency_code: "KWD",
          commercial_licence: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.total).toBe(1);
    expect(result.companies).toHaveLength(1);
    expect(result.companies[0].company_name).toBe("Acme Corp");
  });
});

describe("CompanyDetail shape", () => {
  it("defines the expected fields", () => {
    const mock: import("./schemas").CompanyDetail = {
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
    expect(mock.staff_name).toBe("John Doe");
    expect(mock.currency_code).toBe("KWD");
  });
});
