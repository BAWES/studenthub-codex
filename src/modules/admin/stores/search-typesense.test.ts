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
  isTypesenseAvailable: vi.fn().mockResolvedValue(true),
  STORES_COLLECTION: "stores",
}));

vi.mock("./actions", () => ({
  listStores: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Module under test (imported after mocks are set up)
// ---------------------------------------------------------------------------

const { listStoresTypesense } = await import("./search-typesense");
const { listStores } = await import("./actions");

const now = Math.floor(Date.now() / 1000);

const makeHit = (overrides: Record<string, unknown> = {}) => ({
  document: {
    store_id: 42,
    store_name: "Main Branch",
    store_location: "Kuwait City",
    store_status: 10,
    store_total_candidates: 15,
    store_updated_at: now,
    company_id: 7,
    company_name: "Acme Corp",
    brand_name: "Acme",
    mall_name: "The Avenues",
    manager_name: "Ahmed",
    deleted: 0,
    ...overrides,
  },
});

describe("listStoresTypesense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Fallback: Typesense down
  // -----------------------------------------------------------------------

  it("falls back to Prisma when Typesense health check fails", async () => {
    mockHealthRetrieve.mockRejectedValue(new Error("connection refused"));
    (listStores as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await listStoresTypesense();

    expect(mockHealthRetrieve).toHaveBeenCalledOnce();
    expect(mockCollectionRetrieve).not.toHaveBeenCalled();
    expect(mockSearch).not.toHaveBeenCalled();
    expect(listStores).toHaveBeenCalledOnce();
    expect(result.source).toEqual({ current: "MySQL", target: "Typesense" });
  });

  it("falls back to Prisma when health check returns not ok", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: false });
    (listStores as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await listStoresTypesense();
    expect(listStores).toHaveBeenCalledOnce();
    expect(result.source).toEqual({ current: "MySQL", target: "Typesense" });
  });

  // -----------------------------------------------------------------------
  // Fallback: collection empty
  // -----------------------------------------------------------------------

  it("falls back to Prisma when the collection has 0 documents", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 0 });
    (listStores as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await listStoresTypesense();
    expect(mockCollectionRetrieve).toHaveBeenCalledOnce();
    expect(mockSearch).not.toHaveBeenCalled();
    expect(listStores).toHaveBeenCalledOnce();
    expect(result.source).toEqual({ current: "MySQL", target: "Typesense" });
  });

  it("falls back to Prisma when collection retrieve throws", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockRejectedValue(new Error("not found"));
    (listStores as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await listStoresTypesense();
    expect(listStores).toHaveBeenCalledOnce();
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
        makeHit({ store_id: 1, store_name: "Branch A" }),
        makeHit({ store_id: 2, store_name: "Branch B" }),
      ],
      found: 2,
    });

    const result = await listStoresTypesense({ q: "branch", limit: 10, page: 1 });

    expect(mockSearch).toHaveBeenCalledOnce();
    expect(listStores).not.toHaveBeenCalled();
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(result.source).toEqual({ current: "Typesense", target: "Typesense" });

    // Verify mapping matches StoreRow shape
    expect(result.items[0]).toMatchObject({
      store_id: 1,
      store_name: "Branch A",
      store_status: 10,
    });
  });

  it("sends the correct search parameters to Typesense", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    await listStoresTypesense({ q: "kuwait", status: "active", limit: 5, page: 2 });

    expect(mockSearch).toHaveBeenCalledWith(
      {
        q: "kuwait",
        query_by: "store_name,store_location,brand_name,manager_name,company_name",
        query_by_weights: "4,2,2,1,1",
        filter_by: "deleted: 0 && store_status: 10",
        sort_by: "store_updated_at:desc",
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

    await listStoresTypesense({});

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ q: "*" }),
      {},
    );
  });

  it("applies filter_by for inactive status", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    await listStoresTypesense({ status: "inactive" });

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ filter_by: "deleted: 0 && store_status: 0" }),
      {},
    );
  });

  it("applies filter_by for companyId", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    await listStoresTypesense({ companyId: 7 });

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ filter_by: "deleted: 0 && company_id: 7" }),
      {},
    );
  });

  it("handles null/undefined optional fields in StoreDocument mapping", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({
      hits: [
        makeHit({
          company_name: null,
          brand_name: null,
          mall_name: null,
          manager_name: null,
          store_total_candidates: null,
        }),
      ],
      found: 1,
    });

    const result = await listStoresTypesense();

    expect(result.items[0]).toMatchObject({
      company_name: null,
      brand_name: null,
      mall_name: null,
      manager_name: null,
      store_total_candidates: null,
    });
  });

  it("returns empty results with no hits gracefully", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    const result = await listStoresTypesense({ q: "nonexistent" });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.source).toEqual({ current: "Typesense", target: "Typesense" });
  });

  it("defaults limit to 20 and page to 1 when not provided", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearch.mockResolvedValue({ hits: [], found: 0 });

    await listStoresTypesense();

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ per_page: 20, page: 1 }),
      {},
    );
  });
});
