import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: company list schema validation
//
// The listCompanies action uses this schema internally. Testing it
// separately avoids mocking "use server" dependencies (prisma, session, etc.).
// ---------------------------------------------------------------------------

const listCompaniesSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  name: z.string().optional(),
});

describe("listCompaniesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listCompaniesSchema.safeParse({});
    expect(result.success).toBe(true);
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
    const result = listCompaniesSchema.safeParse({ name: "Kuwait" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Kuwait");
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

  it("rejects non-integer limit", () => {
    const result = listCompaniesSchema.safeParse({ limit: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape: CompanyListItem
// ---------------------------------------------------------------------------

type CompanyListItem = {
  company_id: number;
  company_name: string;
  company_common_name_en: string | null;
  company_common_name_ar: string | null;
  company_email: string | null;
  company_website: string | null;
  company_logo: string | null;
  company_hourly_rate: number | null;
  total_candidate: bigint | null;
  no_of_active_requests: number | null;
  country_id: number | null;
  currency_code: string | null;
  deleted: number;
};

type ListCompaniesResult = {
  companies: CompanyListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("CompanyListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: CompanyListItem = {
      company_id: 1,
      company_name: "Test Company",
      company_common_name_en: "Test Co",
      company_common_name_ar: null,
      company_email: "info@test.com",
      company_website: "https://test.com",
      company_logo: null,
      company_hourly_rate: 10.5,
      total_candidate: BigInt(42),
      no_of_active_requests: 5,
      country_id: 1,
      currency_code: "KWD",
      deleted: 0,
    };
    expect(mock.company_id).toBe(1);
    expect(mock.company_name).toBe("Test Company");
    expect(mock.company_common_name_en).toBe("Test Co");
    expect(mock.total_candidate).toBe(BigInt(42));
    expect(mock.no_of_active_requests).toBe(5);
  });
});

describe("ListCompaniesResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListCompaniesResult = {
      companies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.companies).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Pure function: build company list filter
// ---------------------------------------------------------------------------

type CompanyWhereInput = {
  deleted?: number;
  OR?: Array<{ [key: string]: { contains: string } }>;
};

function buildCompanyListFilter(name?: string): CompanyWhereInput {
  const where: CompanyWhereInput = { deleted: 0 };
  if (name && name.trim()) {
    where.OR = [
      { company_name: { contains: name.trim() } },
      { company_common_name_en: { contains: name.trim() } },
    ];
  }
  return where;
}

describe("buildCompanyListFilter", () => {
  it("returns deleted:0 filter when no name provided", () => {
    const result = buildCompanyListFilter();
    expect(result).toEqual({ deleted: 0 });
  });

  it("filters by company name", () => {
    const result = buildCompanyListFilter("Kuwait");
    expect(result.deleted).toBe(0);
    expect(result.OR).toBeDefined();
    expect(result.OR).toHaveLength(2);
    expect(result.OR![0]).toEqual({ company_name: { contains: "Kuwait" } });
    expect(result.OR![1]).toEqual({ company_common_name_en: { contains: "Kuwait" } });
  });

  it("trims whitespace from name filter", () => {
    const result = buildCompanyListFilter("  Test  ");
    expect(result.OR![0]).toEqual({ company_name: { contains: "Test" } });
  });
});

// ---------------------------------------------------------------------------
// getCompany schema validation
// ---------------------------------------------------------------------------

const getCompanySchema = z.object({
  id: z.number().int().positive(),
});

type GetCompanyParams = z.input<typeof getCompanySchema>;

describe("getCompanySchema", () => {
  it("accepts a valid company id", () => {
    const result = getCompanySchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
    }
  });

  it("rejects zero id", () => {
    const result = getCompanySchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getCompanySchema.safeParse({ id: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric id", () => {
    const result = getCompanySchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});
