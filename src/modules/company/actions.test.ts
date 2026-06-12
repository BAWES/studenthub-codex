import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  adminCompanyItemSchema,
  adminListCompaniesResultSchema,
  adminCompanyDetailResultSchema,
  companyActionResultSchema,
  type AdminCompanyItem,
  type AdminListCompaniesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema definitions matching the input schemas in src/modules/company/actions.ts
// (These are defined inline in actions.ts so we mirror them here for unit tests.)
// ---------------------------------------------------------------------------

const listCompaniesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().max(255).optional(),
  status: z.coerce.number().int().min(0).max(3).optional(),
  currencyCode: z.string().length(3).optional(),
});

type ListCompaniesInput = z.input<typeof listCompaniesSchema>;

const getCompanySchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

type GetCompanyInput = z.input<typeof getCompanySchema>;

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listCompaniesSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listCompaniesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCompaniesSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts name filter", () => {
    const result = listCompaniesSchema.safeParse({ nameFilter: "Tech" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Tech");
    }
  });

  it("accepts status filter", () => {
    const result = listCompaniesSchema.safeParse({ status: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts currency code", () => {
    const result = listCompaniesSchema.safeParse({ currencyCode: "KWD" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currencyCode).toBe("KWD");
    }
  });

  it("rejects invalid status (out of range)", () => {
    const result = listCompaniesSchema.safeParse({ status: 99 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCompaniesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCompaniesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listCompaniesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

describe("getCompanySchema", () => {
  it("accepts valid company ID", () => {
    const result = getCompanySchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
    }
  });

  it("rejects missing company ID", () => {
    const result = getCompanySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero company ID", () => {
    const result = getCompanySchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string company ID to number", () => {
    const result = getCompanySchema.safeParse({ companyId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(7);
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — adminCompanyItemSchema
// ---------------------------------------------------------------------------

describe("adminCompanyItemSchema", () => {
  it("accepts a full company item", () => {
    const item = {
      company_id: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme Corp",
      company_common_name_ar: null,
      company_email: "acme@example.com",
      company_website: "https://acme.com",
      company_logo: "logo.png",
      commercial_licence: "LIC-123",
      company_hourly_rate: 25.5,
      company_bonus_commission: 10.0,
      company_approved_to_hire: true,
      company_status_override: false,
      company_followup: true,
      total_candidate: 42,
      no_of_active_requests: 3,
      country_id: 1,
      currency_code: "KWD",
      parent_company_id: null,
      staff_id: 5,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts minimal item with nulls", () => {
    const item = {
      company_id: 2,
      company_name: "Minimal Co",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: false,
      company_status_override: false,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts bigint for total_candidate", () => {
    const item = {
      company_id: 3,
      company_name: "Big Corp",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: false,
      company_status_override: false,
      company_followup: null,
      total_candidate: BigInt(1000),
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = adminCompanyItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    const item = {
      company_id: "not-a-number",
      company_name: "Test",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: false,
      company_status_override: false,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects company_name as number", () => {
    const item = {
      company_id: 1,
      company_name: 123,
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: false,
      company_status_override: false,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — adminListCompaniesResultSchema
// ---------------------------------------------------------------------------

describe("adminListCompaniesResultSchema", () => {
  it("accepts an empty result", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      companies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a populated result", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      companies: [
        {
          company_id: 1,
          company_name: "Test Corp",
          company_common_name_en: null,
          company_common_name_ar: null,
          company_email: null,
          company_website: null,
          company_logo: null,
          commercial_licence: null,
          company_hourly_rate: null,
          company_bonus_commission: null,
          company_approved_to_hire: true,
          company_status_override: false,
          company_followup: null,
          total_candidate: null,
          no_of_active_requests: null,
          country_id: null,
          currency_code: "KWD",
          parent_company_id: null,
          staff_id: null,
          company_created_at: new Date("2024-01-01"),
          company_updated_at: new Date("2024-06-01"),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing companies field", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      companies: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      companies: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — adminCompanyDetailResultSchema
// ---------------------------------------------------------------------------

describe("adminCompanyDetailResultSchema", () => {
  it("accepts a valid company item", () => {
    const result = adminCompanyDetailResultSchema.safeParse({
      company_id: 1,
      company_name: "Test",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: true,
      company_status_override: false,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    });
    expect(result.success).toBe(true);
  });

  it("accepts null (company not found)", () => {
    const result = adminCompanyDetailResultSchema.safeParse(null);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — companyActionResultSchema
// ---------------------------------------------------------------------------

describe("companyActionResultSchema", () => {
  it("accepts success result", () => {
    const result = companyActionResultSchema.safeParse({ error: "" });
    expect(result.success).toBe(true);
  });

  it("accepts error result", () => {
    const result = companyActionResultSchema.safeParse({ error: "Something went wrong" });
    expect(result.success).toBe(true);
  });

  it("rejects missing error field", () => {
    const result = companyActionResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string error", () => {
    const result = companyActionResultSchema.safeParse({ error: 123 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("AdminCompanyItem type shape", () => {
  it("defines expected fields", () => {
    const mock: AdminCompanyItem = {
      company_id: 1,
      company_name: "Test Corp",
      company_common_name_en: "Test Corp",
      company_common_name_ar: null,
      company_email: "test@example.com",
      company_website: "https://example.com",
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: 10.5,
      company_bonus_commission: 5.0,
      company_approved_to_hire: true,
      company_status_override: false,
      company_followup: null,
      total_candidate: BigInt(42),
      no_of_active_requests: 3,
      country_id: 1,
      currency_code: "KWD",
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    expect(mock.company_id).toBe(1);
    expect(mock.company_name).toBe("Test Corp");
    expect(mock.currency_code).toBe("KWD");
  });
});

describe("AdminListCompaniesResult type shape", () => {
  it("accepts empty result", () => {
    const r: AdminListCompaniesResult = {
      companies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.total).toBe(0);
    expect(r.companies).toHaveLength(0);
  });

  it("accepts populated result", () => {
    const r: AdminListCompaniesResult = {
      companies: [
        {
          company_id: 1,
          company_name: "Acme",
          company_common_name_en: null,
          company_common_name_ar: null,
          company_email: null,
          company_website: null,
          company_logo: null,
          commercial_licence: null,
          company_hourly_rate: null,
          company_bonus_commission: null,
          company_approved_to_hire: true,
          company_status_override: false,
          company_followup: null,
          total_candidate: null,
          no_of_active_requests: null,
          country_id: null,
          currency_code: "KWD",
          parent_company_id: null,
          staff_id: null,
          company_created_at: new Date(),
          company_updated_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(r.companies).toHaveLength(1);
    expect(r.totalPages).toBe(1);
  });
});
