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
      listStoresSchema.safeParse({
        page: 2,
        limit: 50,
        companyId: 1,
        status: "active",
        q: "store",
      }).success,
    ).toBe(true);
  });

  it("accepts status 'inactive'", () => {
    expect(listStoresSchema.safeParse({ status: "inactive" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(listStoresSchema.safeParse({ status: "all" }).success).toBe(false);
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

  it("rejects zero companyId", () => {
    expect(listStoresSchema.safeParse({ companyId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStoreSchema
// ---------------------------------------------------------------------------
describe("getStoreSchema", () => {
  it("accepts valid input", () => {
    expect(getStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("accepts coerced string", () => {
    expect(getStoreSchema.safeParse({ storeId: "5" }).success).toBe(true);
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

  it("rejects non-numeric string", () => {
    expect(getStoreSchema.safeParse({ storeId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createStoreSchema
// ---------------------------------------------------------------------------
describe("createStoreSchema", () => {
  it("accepts minimal input", () => {
    expect(
      createStoreSchema.safeParse({ store_name: "Store 5", store_location: "Floor 3" }).success,
    ).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      createStoreSchema.safeParse({
        store_name: "Store 5",
        store_location: "Floor 3",
        company_id: 1,
        store_manager_uuid: "emp-123",
        brand_uuid: "brand-1",
        mall_uuid: "mall-1",
      }).success,
    ).toBe(true);
  });

  it("rejects missing store_name", () => {
    expect(createStoreSchema.safeParse({ store_location: "Floor 3" }).success).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(createStoreSchema.safeParse({ store_name: "", store_location: "Floor 3" }).success).toBe(false);
  });

  it("rejects store_name exceeding 255 chars", () => {
    expect(
      createStoreSchema.safeParse({ store_name: "x".repeat(256), store_location: "Floor 3" }).success,
    ).toBe(false);
  });

  it("rejects missing store_location", () => {
    expect(createStoreSchema.safeParse({ store_name: "Store 5" }).success).toBe(false);
  });

  it("rejects empty store_location", () => {
    expect(createStoreSchema.safeParse({ store_name: "Store 5", store_location: "" }).success).toBe(false);
  });

  it("rejects store_location exceeding 255 chars", () => {
    expect(
      createStoreSchema.safeParse({ store_name: "Store 5", store_location: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects zero company_id", () => {
    expect(
      createStoreSchema.safeParse({
        store_name: "Store 5",
        store_location: "Floor 3",
        company_id: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStoreSchema
// ---------------------------------------------------------------------------
describe("updateStoreSchema", () => {
  it("accepts minimal input", () => {
    expect(updateStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateStoreSchema.safeParse({
        storeId: 1,
        store_name: "Updated Store",
        store_location: "New Location",
        company_id: 2,
        store_manager_uuid: "emp-456",
        brand_uuid: "brand-2",
        mall_uuid: "mall-2",
      }).success,
    ).toBe(true);
  });

  it("rejects missing storeId", () => {
    expect(updateStoreSchema.safeParse({ store_name: "Store" }).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(updateStoreSchema.safeParse({ storeId: 0, store_name: "Store" }).success).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(updateStoreSchema.safeParse({ storeId: 1, store_name: "" }).success).toBe(false);
  });

  it("rejects store_name exceeding 255 chars", () => {
    expect(
      updateStoreSchema.safeParse({ storeId: 1, store_name: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects empty store_location", () => {
    expect(updateStoreSchema.safeParse({ storeId: 1, store_location: "" }).success).toBe(false);
  });

  it("rejects zero company_id", () => {
    expect(updateStoreSchema.safeParse({ storeId: 1, company_id: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteStoreSchema
// ---------------------------------------------------------------------------
describe("deleteStoreSchema", () => {
  it("accepts valid input", () => {
    expect(deleteStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("accepts coerced string", () => {
    expect(deleteStoreSchema.safeParse({ storeId: "3" }).success).toBe(true);
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
// storeRowSchema
// ---------------------------------------------------------------------------
describe("storeRowSchema", () => {
  const validRow = {
    store_id: 1,
    store_name: "Store 5",
    store_location: "Floor 3, Mall",
    store_status: 1,
    store_total_candidates: null,
    company_name: null,
    brand_name: null,
    mall_name: null,
    manager_name: null,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid store row", () => {
    expect(storeRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(storeRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing store_id", () => {
    const { store_id: _, ...rest } = validRow;
    expect(storeRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects zero store_id", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_id: 0 }).success).toBe(false);
  });

  it("rejects negative store_id", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_id: -1 }).success).toBe(false);
  });

  it("rejects wrong type for store_id", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_id: "abc" }).success).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_name: "" }).success).toBe(false);
  });

  it("rejects empty store_location", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_location: "" }).success).toBe(false);
  });

  it("rejects wrong type for store_status", () => {
    expect(storeRowSchema.safeParse({ ...validRow, store_status: "active" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storeDetailSchema
// ---------------------------------------------------------------------------
describe("storeDetailSchema", () => {
  const validDetail = {
    store: {
      store_id: 1,
      store_name: "Store 5",
      store_location: "Floor 3",
      store_status: 1,
      store_total_candidates: null,
      store_created_at: null,
      store_updated_at: null,
      company: { company_name: "Acme Corp", company_email: null },
      contact: { contact_name: "John", contact_email: null },
      brand: { brand_name_en: "Brand X" },
      mall: { mall_name_en: "Mall Y" },
    },
  };

  it("accepts a valid store detail", () => {
    expect(storeDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null store", () => {
    expect(storeDetailSchema.safeParse({ store: null }).success).toBe(true);
  });

  it("accepts null nested objects", () => {
    expect(
      storeDetailSchema.safeParse({
        store: {
          store_id: 1,
          store_name: "Store",
          store_location: "Here",
          store_status: 1,
          store_total_candidates: null,
          store_created_at: null,
          store_updated_at: null,
          company: null,
          contact: null,
          brand: null,
          mall: null,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects missing store", () => {
    expect(storeDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero store_id", () => {
    expect(
      storeDetailSchema.safeParse({ store: { ...validDetail.store!, store_id: 0 } }).success,
    ).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(
      storeDetailSchema.safeParse({ store: { ...validDetail.store!, store_name: "" } }).success,
    ).toBe(false);
  });

  it("rejects empty store_location", () => {
    expect(
      storeDetailSchema.safeParse({ store: { ...validDetail.store!, store_location: "" } }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoresResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listStoresResultSchema", () => {
  const validResult = {
    items: [
      {
        store_id: 1,
        store_name: "Store 5",
        store_location: "Floor 3",
        store_status: 1,
        store_total_candidates: null,
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

  it("rejects negative totalPages", () => {
    expect(listStoresResultSchema.safeParse({ ...validResult, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storeActionResultSchema
// ---------------------------------------------------------------------------
describe("storeActionResultSchema", () => {
  it("accepts success without optional fields", () => {
    expect(storeActionResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts success with storeId", () => {
    expect(storeActionResultSchema.safeParse({ success: true, storeId: 1 }).success).toBe(true);
  });

  it("accepts error with message", () => {
    expect(storeActionResultSchema.safeParse({ success: false, error: "Not found" }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(storeActionResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(storeActionResultSchema.safeParse({ success: "yes" }).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(storeActionResultSchema.safeParse({ success: true, storeId: 0 }).success).toBe(false);
  });

  it("rejects negative storeId", () => {
    expect(storeActionResultSchema.safeParse({ success: true, storeId: -1 }).success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    expect(storeActionResultSchema.safeParse({ success: false, error: 123 }).success).toBe(false);
  });
});
