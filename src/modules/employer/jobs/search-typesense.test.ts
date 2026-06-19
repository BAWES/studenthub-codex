import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockHealthRetrieve = vi.fn();
const mockCollectionRetrieve = vi.fn();
const mockSearch = vi.fn();

const mockClient = {
  health: { retrieve: mockHealthRetrieve },
  collections: vi.fn((name: string) => ({
    retrieve: mockCollectionRetrieve,
    documents: () => ({
      search: mockSearch,
    }),
  })),
};

vi.mock("@/lib/typesense", () => ({
  getTypesenseClient: vi.fn(() => mockClient),
  JOBS_COLLECTION: "jobs",
}));

vi.mock("./actions", () => ({
  listJobs: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Module under test (imported after mocks are set up)
// ---------------------------------------------------------------------------

const { listJobsTypesense } = await import("./search-typesense");
const { listJobs } = await import("./actions");

const now = Math.floor(Date.now() / 1000);

const makeHit = (overrides: Record<string, unknown> = {}) => ({
  document: {
    job_listing_id: 42,
    employer_id: 7,
    title: "Software Engineer",
    description: "Build cool stuff",
    requirements: "3+ years experience",
    location: "Kuwait City",
    employment_type: "full-time",
    salary_range: "800-1200 KWD",
    status: "active",
    company_name: "Acme Corp",
    created_at: now - 86400 * 30,
    updated_at: now,
    ...overrides,
  },
});

describe("listJobsTypesense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Fallback: Typesense down
  // -----------------------------------------------------------------------

  it("falls back to Prisma when Typesense health check fails", async () => {
    mockHealthRetrieve.mockRejectedValue(new Error("connection refused"));
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await listJobsTypesense();

    expect(mockHealthRetrieve).toHaveBeenCalledOnce();
    expect(mockCollectionRetrieve).not.toHaveBeenCalled();
    expect(mockSearch).not.toHaveBeenCalled();
    expect(listJobs).toHaveBeenCalledOnce();
    expect(result.source).toEqual({ current: "MySQL", target: "Typesense" });
  });

  it("falls back to Prisma when health check returns not ok", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: false });
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await listJobsTypesense();
    expect(listJobs).toHaveBeenCalledOnce();
    expect(result.source).toEqual({ current: "MySQL", target: "Typesense" });
  });

  // -----------------------------------------------------------------------
  // Fallback: collection empty
  // -----------------------------------------------------------------------

  it("falls back to Prisma when the collection has 0 documents", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 0 });
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await listJobsTypesense();
    expect(mockCollectionRetrieve).toHaveBeenCalledOnce();
    expect(mockSearch).not.toHaveBeenCalled();
    expect(listJobs).toHaveBeenCalledOnce();
    expect(result.source).toEqual({ current: "MySQL", target: "Typesense" });
  });

  it("falls back to Prisma when collection retrieve throws", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockRejectedValue(new Error("not found"));
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await listJobsTypesense();
    expect(listJobs).toHaveBeenCalledOnce();
    expect(result.source).toEqual({ current: "MySQL", target: "Typesense" });
  });

  // -----------------------------------------------------------------------
  // Successful Typesense search
  // -----------------------------------------------------------------------

  it("returns Typesense search results with correct shape", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });

    mockSearch.mockResolvedValue({
      hits: [
        makeHit({ job_listing_id: 1, title: "Frontend Dev" }),
        makeHit({ job_listing_id: 2, title: "Backend Dev" }),
      ],
      found: 2,
    });

    const result = await listJobsTypesense({ q: "dev", limit: 10, page: 1 });

    expect(mockSearch).toHaveBeenCalledOnce();
    expect(listJobs).not.toHaveBeenCalled();
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(result.source).toEqual({ current: "Typesense", target: "Typesense" });

    // Verify mapping
    expect(result.items[0]).toMatchObject({
      jobListingId: 1,
      title: "Frontend Dev",
      status: "active",
    });
  });

  it("sends the correct search parameters to Typesense", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    await listJobsTypesense({ q: "engineer", status: "active", limit: 5, page: 2 });

    expect(mockSearch).toHaveBeenCalledWith(
      {
        q: "engineer",
        query_by: "title,description,requirements,location,company_name",
        query_by_weights: "4,2,1,1,1",
        filter_by: "status: active",
        sort_by: "updated_at:desc",
        per_page: 5,
        page: 2,
      },
      {},
    );
  });

  it("uses wildcard query when q is empty", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    await listJobsTypesense({});

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ q: "*" }),
      {},
    );
  });

  it("handles null/undefined optional fields in JobDocument mapping", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({
      hits: [
        makeHit({
          requirements: null,
          location: null,
          employment_type: null,
          salary_range: null,
          status: null,
        }),
      ],
      found: 1,
    });

    const result = await listJobsTypesense();

    expect(result.items[0]).toMatchObject({
      requirements: null,
      location: null,
      employmentType: null,
      salaryRange: null,
      status: null,
    });
  });

  it("returns empty results with no hits gracefully", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    const result = await listJobsTypesense({ q: "nonexistent" });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.source).toEqual({ current: "Typesense", target: "Typesense" });
  });

  it("defaults limit to 20 and page to 1 when not provided", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    await listJobsTypesense();

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ per_page: 20, page: 1 }),
      {},
    );
  });
});
