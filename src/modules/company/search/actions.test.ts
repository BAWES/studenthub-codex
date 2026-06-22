import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockPrismaContactFindMany,
  mockTypesenseSearch,
  mockGetTypesenseClient,
} = vi.hoisted(() => ({
  mockPrismaContactFindMany: vi.fn(),
  mockTypesenseSearch: vi.fn(),
  mockGetTypesenseClient: vi.fn(),
}));

// ── Mock Typesense ──────────────────────────────────────────
vi.mock("@/lib/typesense", () => ({
  getTypesenseClient: mockGetTypesenseClient,
  isTypesenseAvailable: vi.fn().mockResolvedValue(true),
  COMPANIES_COLLECTION: "companies",
  STORES_COLLECTION: "stores",
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_contact: {
      findMany: mockPrismaContactFindMany,
    },
  },
}));

import { searchCompanyEntities } from "./actions";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const LINKED_ID = { company_id: 1 };

const COMPANY_HIT = {
  document: {
    company_id: 1,
    company_name: "Test Corp",
    company_email: "info@testcorp.com",
    company_approved_to_hire: true,
    country_name: "Kuwait",
    company_hourly_rate: 15,
    currency_code: "KWD",
    company_updated_at: "2026-06-01",
    deleted: 0,
  },
};

const STORE_HIT = {
  document: {
    store_id: 101,
    store_name: "Test Store",
    company_name: "Test Corp",
    store_location: "Avenues Mall",
    brand_name: "Test Brand",
    manager_name: "John Manager",
    store_status: 1,
    company_id: 1,
    store_updated_at: "2026-06-01",
    deleted: 0,
  },
};

/**
 * Factory that returns a mock Typesense search function keyed off query_by.
 * Companies query_by starts with "company_name", stores starts with "store_name".
 */
function makeSearchMock(companyHits: any[], storeHits: any[]) {
  return vi.fn().mockImplementation((sp: any) => {
    const qb = sp?.query_by ?? "";
    if (qb.startsWith("company_name")) return { hits: companyHits };
    return { hits: storeHits };
  });
}

// ---------------------------------------------------------------------------
// searchCompanyEntities
// ---------------------------------------------------------------------------

describe("searchCompanyEntities", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: one linked company
    mockPrismaContactFindMany.mockResolvedValue([LINKED_ID]);

    // Default Typesense client
    mockGetTypesenseClient.mockReturnValue({
      collections: () => ({
        documents: () => ({ search: mockTypesenseSearch }),
      }),
    });
  });

  it("returns empty result when contact has no linked companies", async () => {
    mockPrismaContactFindMany.mockResolvedValue([]);

    const result = await searchCompanyEntities("contact-uuid", { query: "test" });

    expect(result.rows).toHaveLength(0);
    expect(result.matchingCount).toBe(0);
  });

  it("searches companies from Typesense", async () => {
    mockTypesenseSearch.mockImplementation(makeSearchMock([COMPANY_HIT], []));

    const result = await searchCompanyEntities("contact-uuid", { query: "test" });

    const row = result.rows.find((r: any) => r.type === "company");
    expect(row).toBeDefined();
    expect(row!.name).toBe("Test Corp");
    expect(row!.email).toBe("info@testcorp.com");
  });

  it("returns store rows when stores are matched", async () => {
    mockTypesenseSearch.mockImplementation(makeSearchMock([], [STORE_HIT]));

    const result = await searchCompanyEntities("contact-uuid", { query: "test" });

    const row = result.rows.find((r: any) => r.type === "store");
    expect(row).toBeDefined();
    expect(row!.name).toBe("Test Store");
  });

  it("returns both company and store results together", async () => {
    mockTypesenseSearch.mockImplementation(makeSearchMock([COMPANY_HIT], [STORE_HIT]));

    const result = await searchCompanyEntities("contact-uuid", { query: "test" });

    expect(result.rows.filter((r: any) => r.type === "company")).toHaveLength(1);
    expect(result.rows.filter((r: any) => r.type === "store")).toHaveLength(1);
  });

  it("returns contact rows from Prisma", async () => {
    mockTypesenseSearch.mockImplementation(makeSearchMock([], []));

    // First call: companyIdsForContact, second call: searchContactsFromPrisma
    mockPrismaContactFindMany
      .mockResolvedValueOnce([LINKED_ID])
      .mockResolvedValueOnce([
        {
          company_contact_uuid: "cu-1",
          contact: { contact_name: "Jane Contact", contact_email: "jane@example.com" },
          company: { company_name: "Contact Corp" },
        },
      ]);

    const result = await searchCompanyEntities("contact-uuid", { query: "test" });

    const row = result.rows.find((r: any) => r.type === "contact");
    expect(row).toBeDefined();
    expect(row!.name).toBe("Jane Contact");
    expect(row!.email).toBe("jane@example.com");
  });

  it("filters by type when specified ('companies')", async () => {
    mockTypesenseSearch.mockImplementation(makeSearchMock([COMPANY_HIT], [STORE_HIT]));

    const result = await searchCompanyEntities("contact-uuid", { query: "test", type: "companies" });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].type).toBe("company");
  });

  it("returns correct facets structure", async () => {
    mockTypesenseSearch.mockImplementation(makeSearchMock([COMPANY_HIT], []));

    const result = await searchCompanyEntities("contact-uuid", { query: "test" });

    expect(result.facets).toHaveLength(1);
    expect(result.facets[0].key).toBe("type");
    const companiesOption = result.facets[0].options.find((o: any) => o.value === "companies");
    expect(companiesOption).toBeDefined();
    expect(companiesOption!.count).toBe(1);
  });

  it("paginates results", async () => {
    const manyHits = Array.from({ length: 30 }, (_, i) => ({
      document: {
        company_id: i + 1,
        company_name: `Company ${i + 1}`,
        company_email: `company${i + 1}@example.com`,
        company_approved_to_hire: true,
        country_name: "Kuwait",
        company_hourly_rate: 15,
        currency_code: "KWD",
        company_updated_at: "2026-06-01",
        deleted: 0,
      },
    }));

    mockTypesenseSearch.mockImplementation(makeSearchMock(manyHits, []));

    const result = await searchCompanyEntities("contact-uuid", { query: "test", page: 2 });

    // 30 company hits + 1 contact "Unknown" row = 31 total
    // page 2: items 26-31 = 6 rows
    expect(result.rows).toHaveLength(6);
    expect(result.matchingCount).toBe(31);
  });

  it("handles Typesense search failures gracefully", async () => {
    mockTypesenseSearch.mockRejectedValue(new Error("Typesense error"));

    const result = await searchCompanyEntities("contact-uuid", { query: "test" });

    expect(result.rows.filter((r: any) => r.type === "company")).toHaveLength(0);
    expect(result.rows.filter((r: any) => r.type === "store")).toHaveLength(0);
  });

  it("uses wildcard query when query is empty", async () => {
    mockTypesenseSearch.mockImplementation(makeSearchMock([COMPANY_HIT], []));

    const result = await searchCompanyEntities("contact-uuid", { query: "" });

    expect(result.query).toBe("");
    expect(mockTypesenseSearch).toHaveBeenCalled();
  });

  it("produces valid output structure for combined results", async () => {
    mockTypesenseSearch.mockImplementation(makeSearchMock([COMPANY_HIT], [STORE_HIT]));

    const result = await searchCompanyEntities("contact-uuid", { query: "test" });

    expect(result).toHaveProperty("query", "test");
    expect(result).toHaveProperty("page", 1);
    expect(result).toHaveProperty("matchingCount");
    expect(result).toHaveProperty("rows");
    expect(result).toHaveProperty("facets");
  });
});
