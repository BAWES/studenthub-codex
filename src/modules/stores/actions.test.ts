import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: store schema validation
// ---------------------------------------------------------------------------

const listStoresSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
});

const getStoreSchema = z.object({
  storeId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoreListItem = {
  store_id: number;
  store_name: string;
  store_location: string;
  store_status: number;
  store_total_candidates: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListStoresResult = {
  stores: StoreListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("listStoresSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listStoresSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts companyId filter", () => {
    const result = listStoresSchema.safeParse({ companyId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
    }
  });

  it("rejects limit over 100", () => {
    const result = listStoresSchema.safeParse({ limit: 150 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStoresSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string values", () => {
    const result = listStoresSchema.safeParse({
      page: "3",
      limit: "25",
      companyId: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.companyId).toBe(2);
    }
  });
});

describe("getStoreSchema", () => {
  it("accepts a valid positive integer", () => {
    const result = getStoreSchema.safeParse({ storeId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects zero", () => {
    const result = getStoreSchema.safeParse({ storeId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative", () => {
    const result = getStoreSchema.safeParse({ storeId: -5 });
    expect(result.success).toBe(false);
  });
});

describe("StoreListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: StoreListItem = {
      store_id: 1,
      store_name: "Main Branch",
      store_location: "Kuwait City",
      store_status: 10,
      store_total_candidates: 25,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-06-01T00:00:00.000Z",
    };
    expect(mock.store_id).toBe(1);
    expect(mock.store_name).toBe("Main Branch");
    expect(mock.store_location).toBe("Kuwait City");
    expect(mock.store_status).toBe(10);
  });
});

describe("ListStoresResult shape", () => {
  it("accepts an empty result set", () => {
    const result: ListStoresResult = {
      stores: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.stores).toHaveLength(0);
  });
});
