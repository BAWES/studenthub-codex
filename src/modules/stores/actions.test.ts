import { describe, it, expect } from "vitest";
import {
  listStoresSchema,
  getStoreSchema,
  listStoresResultSchema,
  storeItemSchema,
} from "./schemas";
import type { StoreListItem, ListStoresResult } from "./schemas";

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

// ---------------------------------------------------------------------------
// Output validation — storeItemSchema
// ---------------------------------------------------------------------------

describe("storeItemSchema", () => {
  it("accepts a valid store item", () => {
    const result = storeItemSchema.safeParse({
      store_id: 1,
      store_name: "Main Branch",
      store_location: "Kuwait City",
      store_status: 10,
      store_total_candidates: 25,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-06-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null total_candidates", () => {
    const result = storeItemSchema.safeParse({
      store_id: 1,
      store_name: "Main Branch",
      store_location: "Kuwait City",
      store_status: 10,
      store_total_candidates: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing store_name", () => {
    const result = storeItemSchema.safeParse({
      store_id: 1,
      store_location: "Kuwait City",
      store_status: 10,
      store_total_candidates: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — listStoresResultSchema
// ---------------------------------------------------------------------------

describe("listStoresResultSchema", () => {
  it("accepts valid list result", () => {
    const result = listStoresResultSchema.safeParse({
      stores: [
        {
          store_id: 1,
          store_name: "Main Branch",
          store_location: "Kuwait City",
          store_status: 10,
          store_total_candidates: 25,
          created_at: "2025-01-01T00:00:00.000Z",
          updated_at: "2025-06-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty stores array", () => {
    const result = listStoresResultSchema.safeParse({
      stores: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts negative total (schema validates type, not business rules)", () => {
    const result = listStoresResultSchema.safeParse({
      stores: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-array stores", () => {
    const result = listStoresResultSchema.safeParse({
      stores: "not an array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing total", () => {
    const result = listStoresResultSchema.safeParse({
      stores: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});
