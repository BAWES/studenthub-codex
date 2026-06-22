import { describe, it, expect } from "vitest";
import {
  listStoresSchema,
  getStoreSchema,
  listStoresRowsSchema,
  listMallsAndBrandsSchema,
  listCompanySelectOptionsSchema,
  storeListItemOutputSchema,
  listStoresResultOutputSchema,
  storeDetailOutputSchema,
  storeRowOutputSchema,
  mallsAndBrandsResultOutputSchema,
  companySelectOptionOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listStoresSchema
// ---------------------------------------------------------------------------
describe("listStoresSchema", () => {
  it("accepts empty input", () => {
    expect(listStoresSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listStoresSchema.safeParse({ page: 1, limit: 50, company_id: 5, store_status: 1 }).success,
    ).toBe(true);
  });

  it("rejects zero page", () => {
    expect(listStoresSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listStoresSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listStoresSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(listStoresSchema.safeParse({ company_id: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStoreSchema
// ---------------------------------------------------------------------------
describe("getStoreSchema", () => {
  it("accepts valid input", () => {
    expect(getStoreSchema.safeParse({ store_id: 42 }).success).toBe(true);
  });

  it("rejects missing store_id", () => {
    expect(getStoreSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero store_id", () => {
    expect(getStoreSchema.safeParse({ store_id: 0 }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getStoreSchema.safeParse({ store_id: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoresRowsSchema
// ---------------------------------------------------------------------------
describe("listStoresRowsSchema", () => {
  it("accepts valid input", () => {
    expect(listStoresRowsSchema.safeParse({ contactUuid: "contact-123" }).success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(listStoresRowsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(listStoresRowsSchema.safeParse({ contactUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listMallsAndBrandsSchema
// ---------------------------------------------------------------------------
describe("listMallsAndBrandsSchema", () => {
  it("accepts valid input", () => {
    expect(listMallsAndBrandsSchema.safeParse({ contactUuid: "contact-1" }).success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(listMallsAndBrandsSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanySelectOptionsSchema
// ---------------------------------------------------------------------------
describe("listCompanySelectOptionsSchema", () => {
  it("accepts valid input", () => {
    expect(listCompanySelectOptionsSchema.safeParse({ contactUuid: "contact-1" }).success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(listCompanySelectOptionsSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storeListItemOutputSchema (output)
// ---------------------------------------------------------------------------
describe("storeListItemOutputSchema", () => {
  const validItem = {
    store_id: 1,
    store_name: "Main Store",
    store_location: "Floor 1",
    store_status: "active" as const,
    mall_name: null,
    brand_name: null,
    manager_name: null,
  };

  it("accepts valid item", () => {
    expect(storeListItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts inactive status", () => {
    expect(
      storeListItemOutputSchema.safeParse({ ...validItem, store_status: "inactive" }).success,
    ).toBe(true);
  });

  it("accepts non-null values", () => {
    expect(
      storeListItemOutputSchema.safeParse({
        ...validItem,
        mall_name: "The Mall",
        brand_name: "Nike",
        manager_name: "John",
      }).success,
    ).toBe(true);
  });

  it("rejects missing store_name", () => {
    const { store_name: _, ...rest } = validItem;
    expect(storeListItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid store_status", () => {
    expect(
      storeListItemOutputSchema.safeParse({ ...validItem, store_status: "unknown" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoresResultOutputSchema (output)
// ---------------------------------------------------------------------------
describe("listStoresResultOutputSchema", () => {
  const validResult = {
    stores: [{
      store_id: 1,
      store_name: "Main Store",
      store_location: "Floor 1",
      store_status: "active" as const,
      mall_name: null,
      brand_name: null,
      manager_name: null,
    }],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(listStoresResultOutputSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty stores array", () => {
    expect(
      listStoresResultOutputSchema.safeParse({ ...validResult, stores: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing stores", () => {
    const { stores: _, ...rest } = validResult;
    expect(listStoresResultOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listStoresResultOutputSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storeDetailOutputSchema (output — nullable)
// ---------------------------------------------------------------------------
describe("storeDetailOutputSchema", () => {
  const validDetail = {
    store_id: 1,
    store_name: "Main Store",
    store_location: "Floor 1",
    store_status: "active" as const,
    company_id: null,
    company_name: null,
    mall_name: null,
    brand_name: null,
    manager_name: null,
    manager_email: null,
    created_at: "2024-01-01",
    updated_at: "2024-01-15",
  };

  it("accepts valid detail", () => {
    expect(storeDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null (nullable wrapper)", () => {
    expect(storeDetailOutputSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing store_name", () => {
    const { store_name: _, ...rest } = validDetail;
    expect(storeDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storeRowOutputSchema (output)
// ---------------------------------------------------------------------------
describe("storeRowOutputSchema", () => {
  const validRow = {
    id: 1,
    name: "Main Store",
    location: "Floor 1",
    mallName: "The Mall",
    brandName: "Nike",
    companyName: "Test Corp",
    managerName: "John",
  };

  it("accepts valid row", () => {
    expect(storeRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validRow;
    expect(storeRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// mallsAndBrandsResultOutputSchema (output)
// ---------------------------------------------------------------------------
describe("mallsAndBrandsResultOutputSchema", () => {
  const validResult = {
    malls: [{ uuid: "mall-1", name: "The Mall" }],
    brands: [{ uuid: "brand-1", name: "Nike" }],
  };

  it("accepts valid result", () => {
    expect(mallsAndBrandsResultOutputSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      mallsAndBrandsResultOutputSchema.safeParse({ malls: [], brands: [] }).success,
    ).toBe(true);
  });

  it("rejects missing malls", () => {
    const { malls: _, ...rest } = validResult;
    expect(mallsAndBrandsResultOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companySelectOptionOutputSchema (output)
// ---------------------------------------------------------------------------
describe("companySelectOptionOutputSchema", () => {
  it("accepts valid option", () => {
    expect(companySelectOptionOutputSchema.safeParse({ id: 1, name: "Test Corp" }).success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(companySelectOptionOutputSchema.safeParse({ id: 1 }).success).toBe(false);
  });
});
