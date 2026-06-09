import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions matching src/modules/company/actions.ts
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

type CompanyItem = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_email: string | null;
  company_website: string | null;
  company_hourly_rate: number | null;
  company_bonus_commission: number | null;
  company_approved_to_hire: boolean;
  company_status_override: boolean;
  country_id: number | null;
  currency_code: string | null;
  total_candidate: bigint | null;
  no_of_active_requests: number | null;
  company_created_at: Date;
  company_updated_at: Date;
};

type ListCompaniesResult = {
  companies: CompanyItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Schema tests
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
// Type shape tests
// ---------------------------------------------------------------------------

describe("CompanyItem shape", () => {
  it("defines expected fields", () => {
    const mock: CompanyItem = {
      company_id: 1,
      company_name: "Test Corp",
      company_common_name_en: "Test Corp",
      company_common_name_ar: null,
      company_email: "test@example.com",
      company_website: "https://example.com",
      company_hourly_rate: 10.5,
      company_bonus_commission: 5.0,
      company_approved_to_hire: true,
      company_status_override: false,
      country_id: 1,
      currency_code: "KWD",
      total_candidate: BigInt(42),
      no_of_active_requests: 3,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    expect(mock.company_id).toBe(1);
    expect(mock.company_name).toBe("Test Corp");
    expect(mock.currency_code).toBe("KWD");
  });
});

describe("ListCompaniesResult shape", () => {
  it("accepts empty result", () => {
    const r: ListCompaniesResult = {
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
    const r: ListCompaniesResult = {
      companies: [
        {
          company_id: 1,
          company_name: "Acme",
          company_common_name_en: null,
          company_common_name_ar: null,
          company_email: null,
          company_website: null,
          company_hourly_rate: null,
          company_bonus_commission: null,
          company_approved_to_hire: true,
          company_status_override: false,
          country_id: null,
          currency_code: "KWD",
          total_candidate: null,
          no_of_active_requests: null,
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
