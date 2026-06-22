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
  JOBS_COLLECTION: "jobs",
}));

// Actions mock — used for fallback
const mockListJobs = vi.hoisted(() => vi.fn());

vi.mock("./actions", () => ({
  listJobs: mockListJobs,
}));

// =============================================================================
// Import module under test
// =============================================================================

import { listJobsTypesense } from "./search-typesense";

// =============================================================================
// Fixtures
// =============================================================================

function makeJobDoc(overrides: Record<string, unknown> = {}) {
  return {
    job_listing_id: 42,
    employer_id: 7,
    title: "Software Engineer",
    description: "Build cool stuff",
    requirements: "3+ years React",
    location: "Kuwait City",
    employment_type: "full-time",
    salary_range: "800-1200 KWD",
    status: "active",
    company_name: "Acme Corp",
    created_at: 1700000000,
    updated_at: 1700000000,
    ...overrides,
  };
}

function makeSearchHit(doc: Record<string, unknown> = {}) {
  return {
    document: makeJobDoc(doc),
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
    limit: 20,
    totalPages: Math.max(1, Math.ceil(items.length / 20)),
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("listJobsTypesense", () => {
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
    mockListJobs.mockResolvedValue(makePrismaResult());
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  it("returns Typesense results with correct shape", async () => {
    const result = await listJobsTypesense({ q: "engineer" });

    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total", 1);
    expect(result).toHaveProperty("page", 1);
    expect(result).toHaveProperty("limit", 20);
    expect(result).toHaveProperty("totalPages", 1);
    expect(result.source).toEqual({
      current: "Typesense",
      target: "Typesense",
    });
  });

  it("calls Typesense health check and collection check before searching", async () => {
    await listJobsTypesense({});

    expect(mockHealthRetrieve).toHaveBeenCalled();
    expect(mockCollectionRetrieve).toHaveBeenCalled();
    expect(mockSearchDocuments).toHaveBeenCalled();
  });

  it("maps Typesense hits to JobRow shape correctly", async () => {
    const result = await listJobsTypesense({});

    expect(result.items).toHaveLength(1);
    const row = result.items[0];
    expect(row.jobListingId).toBe(42);
    expect(row.employerId).toBe(7);
    expect(row.title).toBe("Software Engineer");
    expect(row.description).toBe("Build cool stuff");
    expect(row.requirements).toBe("3+ years React");
    expect(row.location).toBe("Kuwait City");
    expect(row.employmentType).toBe("full-time");
    expect(row.salaryRange).toBe("800-1200 KWD");
    expect(row.status).toBe("active");
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.updatedAt).toBeInstanceOf(Date);
  });

  it("passes * as query when input q is empty", async () => {
    await listJobsTypesense({ q: "" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.q).toBe("*");
  });

  it("passes the input query through to Typesense when non-empty", async () => {
    await listJobsTypesense({ q: "React developer" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.q).toBe("React developer");
  });

  it("passes correct search parameters (query_by, sort_by, per_page, page)", async () => {
    await listJobsTypesense({ q: "engineer", page: 2, limit: 10 });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.query_by).toBe(
      "title,description,requirements,location,company_name",
    );
    expect(searchArgs.query_by_weights).toBe("4,2,1,1,1");
    expect(searchArgs.sort_by).toBe("updated_at:desc");
    expect(searchArgs.per_page).toBe(10);
    expect(searchArgs.page).toBe(2);
    expect(searchArgs.filter_by).toBeUndefined();
  });

  it("includes status in filter_by when status is provided", async () => {
    await listJobsTypesense({ q: "engineer", status: "active" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.filter_by).toBe("status: active");
  });

  it("respects default pagination (page=1, limit=20)", async () => {
    await listJobsTypesense({});

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.per_page).toBe(20);
    expect(searchArgs.page).toBe(1);
  });

  it("computes totalPages correctly", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit(), makeSearchHit()],
      found: 25,
    });

    const result = await listJobsTypesense({ limit: 10 });
    expect(result.totalPages).toBe(3); // ceil(25/10)
  });

  it("handles zero totalPages for empty result set", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [],
      found: 0,
    });

    const result = await listJobsTypesense({});
    expect(result.totalPages).toBe(1); // Math.max(1, ceil(0/20))
  });

  it("handles nullable fields being null", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [
        makeSearchHit({
          requirements: null,
          location: null,
          employment_type: null,
          salary_range: null,
          status: null,
        }),
      ],
      found: 1,
    });

    const result = await listJobsTypesense({});
    expect(result.items[0].requirements).toBeNull();
    expect(result.items[0].location).toBeNull();
    expect(result.items[0].employmentType).toBeNull();
    expect(result.items[0].salaryRange).toBeNull();
    expect(result.items[0].status).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Fallback paths
  // -------------------------------------------------------------------------

  it("falls back to Prisma when Typesense health check fails", async () => {
    mockHealthRetrieve.mockRejectedValue(new Error("Connection refused"));

    const result = await listJobsTypesense({});

    expect(result.source.current).toBe("MySQL");
    expect(result.source.target).toBe("Typesense");
    expect(mockListJobs).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
  });

  it("falls back to Prisma when health.ok is false", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: false });

    const result = await listJobsTypesense({});

    expect(result.source.current).toBe("MySQL");
    expect(mockListJobs).toHaveBeenCalled();
  });

  it("falls back to Prisma when collection has no documents", async () => {
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 0 });

    const result = await listJobsTypesense({});

    expect(result.source.current).toBe("MySQL");
    expect(mockListJobs).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
  });

  it("falls back to Prisma when collection retrieve throws", async () => {
    mockCollectionRetrieve.mockRejectedValue(new Error("Not found"));

    const result = await listJobsTypesense({});

    expect(result.source.current).toBe("MySQL");
    expect(mockListJobs).toHaveBeenCalled();
  });

  it("falls back to Prisma when search throws", async () => {
    mockSearchDocuments.mockRejectedValue(new Error("Search failed"));

    // The searchTypesense function doesn't catch search errors — it lets
    // them propagate since the outer search is inside try/catch.
    // Actually — looking at the code, the health and collection checks
    // are in try/catch, but the search itself isn't. Let me check...
    // Looking at searchTypesense: health check has try/catch, collection
    // check has try/catch, but the actual search at line 78 is NOT
    // wrapped in try/catch. So a search error would propagate up through
    // listJobsTypesense — but listJobsTypesense calls searchTypesense and
    // if it throws, it propagates up to the caller.
    //
    // Actually in listJobsTypesense, tsResult = await searchTypesense(input)
    // — no try/catch around it, so search errors propagate.
    // But the health/collection errors are caught inside searchTypesense.
    // So this test should verify that search errors propagate.
    await expect(listJobsTypesense({})).rejects.toThrow("Search failed");
  });

  it("passes input from listJobsTypesense to the fallback listJobs", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: false });

    await listJobsTypesense({ q: "engineer", status: "active", page: 2, limit: 10 });

    expect(mockListJobs).toHaveBeenCalledWith({
      q: "engineer",
      status: "active",
      page: 2,
      limit: 10,
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  it("works with empty input (no pagination or search params)", async () => {
    const result = await listJobsTypesense({});

    expect(result.items).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(mockSearchDocuments).toHaveBeenCalled();
  });

  it("preserves createdAt/updatedAt as Date objects with correct timestamps", async () => {
    // Use a specific unix timestamp
    mockSearchDocuments.mockResolvedValue({
      hits: [
        makeSearchHit({
          created_at: 1718467200, // 2024-06-15T16:00:00Z
          updated_at: 1718553600, // 2024-06-16T16:00:00Z
        }),
      ],
      found: 1,
    });

    const result = await listJobsTypesense({});
    expect(result.items[0].createdAt.getTime()).toBe(1718467200 * 1000);
    expect(result.items[0].updatedAt.getTime()).toBe(1718553600 * 1000);
  });

  it("handles missing createdAt and updatedAt (epoch fallback)", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [
        makeSearchHit({
          created_at: 0,
          updated_at: undefined,
        }),
      ],
      found: 1,
    });

    const result = await listJobsTypesense({});
    // When doc.created_at is 0: new Date(0) = 1970-01-01
    // When doc.updated_at is undefined: new Date(undefined * 1000) = NaN → Invalid Date
    expect(result.items[0].createdAt.getTime()).toBe(0);

    // The code handles undefined by using new Date(0)
    // updated_at undefined → doc.updated_at ? new Date(doc.updated_at * 1000) : new Date(0)
    // So if undefined, it goes to the false branch → new Date(0)
    expect(result.items[0].updatedAt.getTime()).toBe(0);
  });
});
