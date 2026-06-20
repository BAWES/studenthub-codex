import { describe, it, expect } from "vitest";
import {
  listStoresSchema,
  getStoreSchema,
  createStoreSchema,
  updateStoreSchema,
  deleteStoreSchema,
  storeRowSchema,
  storeDetailSchema,
  listStoresResultSchema,
  storeActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listStoresSchema
// ---------------------------------------------------------------------------
describe("listStoresSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listStoresSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listStoresSchema.safeParse({ page: 2, limit: 50, companyId: 1, status: "active", q: "store A" }).success,
    ).toBe(true);
  });

  it("accepts inactive status", () => {
    expect(listStoresSchema.safeParse({ status: "inactive" }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listStoresSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listStoresSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listStoresSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(listStoresSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(listStoresSchema.safeParse({ companyId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStoreSchema
// ---------------------------------------------------------------------------
describe("getStoreSchema", () => {
  it("accepts valid input", () => {
    expect(getStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("rejects missing storeId", () => {
    expect(getStoreSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(getStoreSchema.safeParse({ storeId: 0 }).success).toBe(false);
  });

  it("rejects negative storeId", () => {
    expect(getStoreSchema.safeParse({ storeId: -1 }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getStoreSchema.safeParse({ storeId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createStoreSchema
// ---------------------------------------------------------------------------
describe("createStoreSchema", () => {
  it("accepts valid input (minimal)", () => {
    expect(createStoreSchema.safeParse({ store_name: "Store A", store_location: "Location A" }).success).toBe(true);
  });

  it("accepts full input with optionals", () => {
    expect(
      createStoreSchema.safeParse({
        store_name: "Store A",
        store_location: "Location A",
        company_id: 1,
        store_manager_uuid: "uuid-123",
        brand_uuid: "brand-456",
        mall_uuid: "mall-789",
      }).success,
    ).toBe(true);
  });

  it("rejects missing store_name", () => {
    expect(createStoreSchema.safeParse({ store_location: "Loc" }).success).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(createStoreSchema.safeParse({ store_name: "", store_location: "Loc" }).success).toBe(false);
  });

  it("rejects store_name exceeding 255 chars", () => {
    expect(
      createStoreSchema.safeParse({ store_name: "x".repeat(256), store_location: "Loc" }).success,
    ).toBe(false);
  });

  it("rejects missing store_location", () => {
    expect(createStoreSchema.safeParse({ store_name: "Store" }).success).toBe(false);
  });

  it("rejects empty store_location", () => {
    expect(createStoreSchema.safeParse({ store_name: "Store", store_location: "" }).success).toBe(false);
  });

  it("rejects store_location exceeding 255 chars", () => {
    expect(
      createStoreSchema.safeParse({ store_name: "S", store_location: "x".repeat(256) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStoreSchema
// ---------------------------------------------------------------------------
describe("updateStoreSchema", () => {
  it("accepts minimal input (storeId only)", () => {
    expect(updateStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateStoreSchema.safeParse({ storeId: 1, store_name: "Updated", store_location: "New Loc", company_id: 2 }).success,
    ).toBe(true);
  });

  it("rejects missing storeId", () => {
    expect(updateStoreSchema.safeParse({ store_name: "S" }).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(updateStoreSchema.safeParse({ storeId: 0 }).success).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(updateStoreSchema.safeParse({ storeId: 1, store_name: "" }).success).toBe(false);
  });

  it("rejects store_name exceeding 255 chars", () => {
    expect(
      updateStoreSchema.safeParse({ storeId: 1, store_name: "x".repeat(256) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteStoreSchema
// ---------------------------------------------------------------------------
describe("deleteStoreSchema", () => {
  it("accepts valid input", () => {
    expect(deleteStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("rejects missing storeId", () => {
    expect(deleteStoreSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(deleteStoreSchema.safeParse({ storeId: 0 }).success).toBe(false);
  });

  it("rejects negative storeId", () => {
    expect(deleteStoreSchema.safeParse({ storeId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storeRowSchema (output)
// ---------------------------------------------------------------------------
describe("storeRowSchema", () => {
  const validRow = {
    store_id: 1,
    store_name: "Main Store",
    store_location: "Location A",
    store_status: 1,
    store_total_candidates: 5,
    company_name: "Company A",
    brand_name: "Brand A",
    mall_name: "Mall A",
    manager_name: "Manager A",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  };

  it("accepts a valid row", () => {
    expect(storeRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      storeRowSchema.safeParse({
        ...validRow,
        store_total_candidates: null,
        company_name: null,
        brand_name: null,
        mall_name: null,
        manager_name: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing store_id", () => {
    const { store_id: _, ...rest } = validRow;
    expect(storeRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_name: "" }).success).toBe(false);
  });

  it("rejects empty store_location", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_location: "" }).success).toBe(false);
  });

  it("rejects negative store_id", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_id: -1 }).success).toBe(false);
  });

  it("rejects wrong type for store_status", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_status: "active" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storeDetailSchema (output)
// ---------------------------------------------------------------------------
describe("storeDetailSchema", () => {
  const validDetail = {
    store: {
      store_id: 1,
      store_name: "Store A",
      store_location: "Loc A",
      store_status: 1,
      store_total_candidates: 10,
      store_created_at: "2024-01-01T00:00:00Z",
      store_updated_at: "2024-01-02T00:00:00Z",
      company: { company_name: "ACME", company_email: "acme@test.com" },
      contact: { contact_name: "John", contact_email: "john@test.com" },
      brand: { brand_name_en: "Brand" },
      mall: { mall_name_en: "Mall" },
    },
  };

  it("accepts a valid detail", () => {
    expect(storeDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null store", () => {
    expect(storeDetailSchema.safeParse({ store: null }).success).toBe(true);
  });

  it("accepts nullable nested objects as null", () => {
    expect(
      storeDetailSchema.safeParse({
        store: { ...validDetail.store, company: null, contact: null, brand: null, mall: null },
      }).success,
    ).toBe(true);
  });

  it("rejects missing store field", () => {
    expect(storeDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing store_name", () => {
    const { store_name: _, ...storeRest } = validDetail.store;
    expect(storeDetailSchema.safeParse({ store: storeRest }).success).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(storeDetailSchema.safeParse({ store: { ...validDetail.store, store_name: "" } }).success).toBe(false);
  });

  it("rejects negative store_id", () => {
    expect(storeDetailSchema.safeParse({ store: { ...validDetail.store, store_id: -1 } }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoresResultSchema (output)
// ---------------------------------------------------------------------------
describe("listStoresResultSchema", () => {
  const validResult = {
    items: [
      {
        store_id: 1,
        store_name: "Store A",
        store_location: "Loc A",
        store_status: 1,
        store_total_candidates: 5,
        company_name: null,
        brand_name: null,
        mall_name: null,
        manager_name: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listStoresResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listStoresResultSchema.safeParse({ ...validResult, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listStoresResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listStoresResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listStoresResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(listStoresResultSchema.safeParse({ ...validResult, limit: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listStoresResultSchema.safeParse({ ...validResult, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storeActionResultSchema (output)
// ---------------------------------------------------------------------------
describe("storeActionResultSchema", () => {
  it("accepts success result", () => {
    expect(storeActionResultSchema.safeParse({ success: true, storeId: 1 }).success).toBe(true);
  });

  it("accepts error result", () => {
    expect(storeActionResultSchema.safeParse({ success: false, error: "Something went wrong" }).success).toBe(true);
  });

  it("accepts success without optional storeId", () => {
    expect(storeActionResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(storeActionResultSchema.safeParse({ success: "true" }).success).toBe(false);
  });

  it("rejects negative storeId", () => {
    expect(storeActionResultSchema.safeParse({ success: true, storeId: -1 }).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(storeActionResultSchema.safeParse({ success: true, storeId: 0 }).success).toBe(false);
  });
});
