import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// =============================================================================
// Mock all external dependencies before importing the module under test
// =============================================================================

// Typesense client mocks
const mockHealthRetrieve = vi.hoisted(() => vi.fn());
const mockCollectionRetrieve = vi.hoisted(() => vi.fn());
const mockSearchDocuments = vi.hoisted(() => vi.fn());

const mockGetTypesenseClient = vi.hoisted(() =>
  vi.fn(() => ({
    health: { retrieve: mockHealthRetrieve },
    collections: () => ({
      retrieve: mockCollectionRetrieve,
      documents: () => ({ search: mockSearchDocuments }),
    }),
  })),
);

vi.mock("@/lib/typesense", () => ({
  getTypesenseClient: mockGetTypesenseClient,
  isTypesenseAvailable: vi.fn().mockResolvedValue(true),
  COMPANIES_COLLECTION: "companies",
}));

// Format mocks — return predictable values
const mockFormatMoney = vi.hoisted(() => vi.fn(() => "0 KWD"));
const mockFormatDate = vi.hoisted(() => vi.fn(() => "Jan 1, 2024"));

vi.mock("@/modules/workspace/format", () => ({
  formatMoney: mockFormatMoney,
  formatDate: mockFormatDate,
}));

// Actions mock — used for fallback
const mockListAdminCompanies = vi.hoisted(() => vi.fn());

vi.mock("./actions", () => ({
  listAdminCompanies: mockListAdminCompanies,
}));

// =============================================================================
// Import module under test
// =============================================================================

import { listAdminCompaniesTypesense } from "./search-typesense";

// =============================================================================
// Fixtures
// =============================================================================

function makeCompanyDoc(overrides: Record<string, unknown> = {}) {
  return {
    company_id: 42,
    company_name: "Acme Corp",
    company_common_name_en: "Acme",
    company_email: "acme@example.com",
    company_approved_to_hire: true,
    no_of_active_requests: 5,
    company_hourly_rate: 10.5,
    currency_code: "KWD",
    company_updated_at: 1700000000,
    staff_name: "Ahmed Ali",
    country_name: "Kuwait",
    deleted: 0,
    ...overrides,
  };
}

function makeSearchHit(doc: Record<string, unknown> = {}) {
  return {
    document: makeCompanyDoc(doc),
    text_match: 100,
    text_match_info: {
      best_field_score: "100",
      best_field_weight: 10,
      fields_matched: 2,
      score: "1.0",
      tokens_matched: 2,
    },
  };
}

function makePrismaResult(items: any[] = []) {
  return {
    items,
    total: items.length,
    page: 1,
    limit: 60,
    totalPages: Math.max(1, Math.ceil(items.length / 60)),
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("listAdminCompaniesTypesense", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default healthy Typesense
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 50 });
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit()],
      found: 1,
    });

    // Default fallback
    mockListAdminCompanies.mockResolvedValue(makePrismaResult());
  });

  // ---------------------------------------------------------------------------
  // Happy path
  // ---------------------------------------------------------------------------

  it("returns Typesense results with correct shape", async () => {
    const result = await listAdminCompaniesTypesense({ q: "Acme" });

    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total", 1);
    expect(result).toHaveProperty("page", 1);
    expect(result).toHaveProperty("limit", 60);
    expect(result).toHaveProperty("totalPages", 1);
    expect(result.source).toEqual({
      current: "Typesense",
      target: "Typesense",
    });
  });

  it("calls Typesense health check and collection check before searching", async () => {
    await listAdminCompaniesTypesense({});

    expect(mockHealthRetrieve).toHaveBeenCalled();
    expect(mockCollectionRetrieve).toHaveBeenCalled();
    expect(mockSearchDocuments).toHaveBeenCalled();
  });

  it("maps Typesense hits to CompanyRow shape correctly", async () => {
    const result = await listAdminCompaniesTypesense({});

    expect(result.items).toHaveLength(1);
    const row = result.items[0];
    expect(row.id).toBe(42);
    expect(row.name).toBe("Acme Corp");
    expect(row.email).toBe("acme@example.com");
    expect(row.owner).toBe("Ahmed Ali");
    expect(row.requests).toBe(5);
    expect(row.status).toBe("Approved");
    expect(typeof row.rate).toBe("string");
    expect(typeof row.updated).toBe("string");
  });

  it("passes * as query when input q is empty", async () => {
    await listAdminCompaniesTypesense({ q: "" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.q).toBe("*");
  });

  it("passes the input query through to Typesense when non-empty", async () => {
    await listAdminCompaniesTypesense({ q: "Acme Corp" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.q).toBe("Acme Corp");
  });

  it("passes correct search parameters (query_by, sort_by, per_page, page)", async () => {
    await listAdminCompaniesTypesense({ q: "Acme", page: 2, limit: 10 });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.query_by).toBe(
      "company_name,company_common_name_en,company_email,staff_name",
    );
    expect(searchArgs.query_by_weights).toBe("4,2,1,1");
    expect(searchArgs.sort_by).toBe("company_updated_at:desc");
    expect(searchArgs.per_page).toBe(10);
    expect(searchArgs.page).toBe(2);
  });

  it("includes deleted: 0 filter_by always", async () => {
    await listAdminCompaniesTypesense({ q: "Acme" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.filter_by).toContain("deleted: 0");
  });

  it("includes approved filter_by when status is approved", async () => {
    await listAdminCompaniesTypesense({ q: "Acme", status: "approved" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.filter_by).toContain("company_approved_to_hire: true");
  });

  it("includes not_approved filter_by when status is not_approved", async () => {
    await listAdminCompaniesTypesense({ q: "Acme", status: "not_approved" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.filter_by).toContain("company_approved_to_hire: false");
  });

  it("omits status filter_by when status is all", async () => {
    await listAdminCompaniesTypesense({ q: "Acme", status: "all" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    // Should NOT contain company_approved_to_hire filter when status is "all"
    expect(searchArgs.filter_by).not.toContain("company_approved_to_hire");
  });

  it("respects default pagination (page=1, limit=60)", async () => {
    await listAdminCompaniesTypesense({});

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.per_page).toBe(60);
    expect(searchArgs.page).toBe(1);
  });

  it("computes totalPages correctly", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit(), makeSearchHit()],
      found: 25,
    });

    const result = await listAdminCompaniesTypesense({ limit: 10 });
    expect(result.totalPages).toBe(3); // ceil(25/10)
  });

  it("handles zero found results (totalPages = 1)", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [],
      found: 0,
    });

    const result = await listAdminCompaniesTypesense({});
    // Math.max(1, ceil(0/60)) = 1
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("maps approved-to-hire false as 'Not approved' status", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({ company_approved_to_hire: false })],
      found: 1,
    });

    const result = await listAdminCompaniesTypesense({});
    expect(result.items[0].status).toBe("Not approved");
  });

  it("maps null email to 'No email' fallback", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({ company_email: null })],
      found: 1,
    });

    const result = await listAdminCompaniesTypesense({});
    expect(result.items[0].email).toBe("No email");
  });

  it("maps null staff_name to 'Unassigned' owner", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({ staff_name: null })],
      found: 1,
    });

    const result = await listAdminCompaniesTypesense({});
    expect(result.items[0].owner).toBe("Unassigned");
  });

  it("handles null no_of_active_requests as 0", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({ no_of_active_requests: null })],
      found: 1,
    });

    const result = await listAdminCompaniesTypesense({});
    expect(result.items[0].requests).toBe(0);
  });

  it("handles null company_updated_at as empty string", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({ company_updated_at: null })],
      found: 1,
    });

    const result = await listAdminCompaniesTypesense({});
    expect(result.items[0].updated).toBe("");
  });

  it("uses formatMoney with correct args", async () => {
    mockFormatMoney.mockClear();
    await listAdminCompaniesTypesense({});

    expect(mockFormatMoney).toHaveBeenCalledWith(10.5, "KWD");
  });

  it("uses formatDate with correct Date from timestamp", async () => {
    mockFormatDate.mockClear();
    await listAdminCompaniesTypesense({});

    // company_updated_at is 1700000000 -> new Date(1700000000 * 1000)
    expect(mockFormatDate).toHaveBeenCalledWith(
      expect.any(Date),
    );
  });

  it("passes the correct timestamp to formatDate", async () => {
    mockFormatDate.mockClear();
    await listAdminCompaniesTypesense({});

    const dateArg: Date = (mockFormatDate.mock.calls[0] as any)[0];
    expect(dateArg.getTime()).toBe(1700000000 * 1000);
  });

  // ---------------------------------------------------------------------------
  // Fallback paths
  // ---------------------------------------------------------------------------

  it("falls back to Prisma when Typesense health check fails", async () => {
    mockHealthRetrieve.mockRejectedValue(new Error("Connection refused"));

    const result = await listAdminCompaniesTypesense({});

    expect(result.source.current).toBe("MySQL");
    expect(result.source.target).toBe("Typesense");
    expect(mockListAdminCompanies).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
  });

  it("falls back to Prisma when health.ok is false", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: false });

    const result = await listAdminCompaniesTypesense({});

    expect(result.source.current).toBe("MySQL");
    expect(mockListAdminCompanies).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
  });

  it("falls back to Prisma when collection has no documents", async () => {
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 0 });

    const result = await listAdminCompaniesTypesense({});

    expect(result.source.current).toBe("MySQL");
    expect(mockListAdminCompanies).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
  });

  it("falls back to Prisma when collection retrieve throws", async () => {
    mockCollectionRetrieve.mockRejectedValue(new Error("Not found"));

    const result = await listAdminCompaniesTypesense({});

    expect(result.source.current).toBe("MySQL");
    expect(mockListAdminCompanies).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
  });

  it("propagates search errors (not caught in searchTypesense)", async () => {
    mockSearchDocuments.mockRejectedValue(new Error("Search failed"));

    await expect(listAdminCompaniesTypesense({})).rejects.toThrow("Search failed");
  });

  it("passes input from listAdminCompaniesTypesense to the fallback listAdminCompanies", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: false });

    await listAdminCompaniesTypesense({ q: "Acme", status: "approved", page: 2, limit: 10 });

    expect(mockListAdminCompanies).toHaveBeenCalledWith({
      q: "Acme",
      status: "approved",
      page: 2,
      limit: 10,
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  it("works with empty input (no pagination or search params)", async () => {
    const result = await listAdminCompaniesTypesense({});

    expect(result.items).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(60);
    expect(mockSearchDocuments).toHaveBeenCalled();
  });

  it("works with no input at all (default empty object)", async () => {
    const result = await listAdminCompaniesTypesense();

    expect(result.items).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(60);
    expect(mockSearchDocuments).toHaveBeenCalled();
  });

  it("handles completely empty search results gracefully", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [],
      found: 0,
    });

    const result = await listAdminCompaniesTypesense({ q: "nonexistent" });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("handles hits with missing document fields gracefully", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [
        makeSearchHit({
          company_name: null,
          company_email: null,
          staff_name: null,
          no_of_active_requests: null,
          company_approved_to_hire: null,
          company_hourly_rate: null,
          currency_code: null,
          company_updated_at: null,
        }),
      ],
      found: 1,
    });

    const result = await listAdminCompaniesTypesense({});
    expect(result.items).toHaveLength(1);
    const row = result.items[0];
    // name is company_name which is null — downstream assumes string
    expect(row.name).toBeNull();
    expect(row.email).toBe("No email");
    expect(row.owner).toBe("Unassigned");
    expect(row.requests).toBe(0);
    expect(row.status).toBe("Not approved"); // null -> false
    expect(row.updated).toBe("");
  });
});
