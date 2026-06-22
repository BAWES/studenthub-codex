import { describe, it, expect } from "vitest";
import { z } from "zod";
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
  type StoreListItem,
  type ListStoresResultOutput,
  type StoreDetailOutput,
  type StoreRowOutput,
  type MallsAndBrandsResultOutput,
  type CompanySelectOptionOutput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — listStoresSchema
// ---------------------------------------------------------------------------

describe("listStoresSchema", () => {
  it("accepts empty input (all optional fields)", () => {
    const result = listStoresSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid pagination params", () => {
    const result = listStoresSchema.safeParse({
      page: 1,
      limit: 20,
      company_id: 42,
      store_status: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative page", () => {
    const result = listStoresSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listStoresSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listStoresSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — getStoreSchema
// ---------------------------------------------------------------------------

describe("getStoreSchema", () => {
  it("accepts a valid store ID", () => {
    const result = getStoreSchema.safeParse({ store_id: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects zero", () => {
    const result = getStoreSchema.safeParse({ store_id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative store ID", () => {
    const result = getStoreSchema.safeParse({ store_id: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing store_id", () => {
    const result = getStoreSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — listStoresRowsSchema
// ---------------------------------------------------------------------------

describe("listStoresRowsSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = listStoresRowsSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty contact UUID", () => {
    const result = listStoresRowsSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contact UUID", () => {
    const result = listStoresRowsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — listMallsAndBrandsSchema
// ---------------------------------------------------------------------------

describe("listMallsAndBrandsSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = listMallsAndBrandsSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty contact UUID", () => {
    const result = listMallsAndBrandsSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — listCompanySelectOptionsSchema
// ---------------------------------------------------------------------------

describe("listCompanySelectOptionsSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = listCompanySelectOptionsSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty contact UUID", () => {
    const result = listCompanySelectOptionsSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — storeListItemOutputSchema
// ---------------------------------------------------------------------------

describe("storeListItemOutputSchema", () => {
  it("accepts a valid store list item", () => {
    const result = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Main Branch",
      store_location: "Floor 1",
      store_status: "active",
      mall_name: "The Avenues",
      brand_name: "Nike",
      manager_name: "Ali",
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable strings", () => {
    const result = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Branch",
      store_location: "",
      store_status: "inactive",
      mall_name: null,
      brand_name: null,
      manager_name: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid store_status", () => {
    const result = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Branch",
      store_location: "",
      store_status: "unknown",
      mall_name: null,
      brand_name: null,
      manager_name: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = storeListItemOutputSchema.safeParse({
      store_name: "Branch",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — listStoresResultOutputSchema
// ---------------------------------------------------------------------------

describe("listStoresResultOutputSchema", () => {
  it("accepts a valid paginated result", () => {
    const result = listStoresResultOutputSchema.safeParse({
      stores: [
        {
          store_id: 1,
          store_name: "Branch 1",
          store_location: "Floor 1",
          store_status: "active",
          mall_name: null,
          brand_name: null,
          manager_name: null,
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
    const result = listStoresResultOutputSchema.safeParse({
      stores: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listStoresResultOutputSchema.safeParse({
      stores: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listStoresResultOutputSchema.safeParse({
      stores: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — storeDetailOutputSchema
// ---------------------------------------------------------------------------

describe("storeDetailOutputSchema", () => {
  const validDetail = {
    store_id: 42,
    store_name: "Flagship Store",
    store_location: "The Avenues, Floor 2",
    store_status: "active" as const,
    company_id: 10,
    company_name: "ACME Corp",
    mall_name: "The Avenues",
    brand_name: "Adidas",
    manager_name: "Sara",
    manager_email: "sara@acme.com",
    created_at: "2024-01-15T00:00:00.000Z",
    updated_at: "2024-06-01T00:00:00.000Z",
  };

  it("accepts a valid store detail", () => {
    const result = storeDetailOutputSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("accepts null (store not found)", () => {
    const result = storeDetailOutputSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("accepts nullable sub-fields", () => {
    const result = storeDetailOutputSchema.safeParse({
      ...validDetail,
      company_id: null,
      company_name: null,
      mall_name: null,
      brand_name: null,
      manager_name: null,
      manager_email: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = storeDetailOutputSchema.safeParse({
      store_name: "No ID",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — storeRowOutputSchema
// ---------------------------------------------------------------------------

describe("storeRowOutputSchema", () => {
  it("accepts a valid DataTable store row", () => {
    const result = storeRowOutputSchema.safeParse({
      id: 1,
      name: "Main Branch",
      location: "Floor 1",
      mallName: "Avenues",
      brandName: "Nike",
      companyName: "ACME",
      managerName: "Ali",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = storeRowOutputSchema.safeParse({
      id: 1,
      name: "Branch",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — mallsAndBrandsResultOutputSchema
// ---------------------------------------------------------------------------

describe("mallsAndBrandsResultOutputSchema", () => {
  it("accepts valid malls and brands", () => {
    const result = mallsAndBrandsResultOutputSchema.safeParse({
      malls: [{ uuid: "m-uuid-1", name: "The Avenues" }],
      brands: [{ uuid: "b-uuid-1", name: "Nike" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty arrays", () => {
    const result = mallsAndBrandsResultOutputSchema.safeParse({
      malls: [],
      brands: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const result = mallsAndBrandsResultOutputSchema.safeParse({
      malls: [{ name: "Avenues" }],
      brands: [],
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — companySelectOptionOutputSchema
// ---------------------------------------------------------------------------

describe("companySelectOptionOutputSchema", () => {
  it("accepts a valid option", () => {
    const result = companySelectOptionOutputSchema.safeParse({
      id: 42,
      name: "ACME Corp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = companySelectOptionOutputSchema.safeParse({
      name: "ACME Corp",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type-level tests
// ---------------------------------------------------------------------------

describe("StoreListItem type", () => {
  it("accepts a valid item", () => {
    const item: StoreListItem = {
      store_id: 1,
      store_name: "Branch",
      store_location: "Floor 1",
      store_status: "active",
      mall_name: null,
      brand_name: null,
      manager_name: null,
    };
    expect(item.store_name).toBe("Branch");
  });
});

describe("ListStoresResultOutput type", () => {
  it("accepts a valid paginated result", () => {
    const result: ListStoresResultOutput = {
      stores: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
  });
});

describe("StoreDetailOutput type", () => {
  it("accepts null", () => {
    const detail: StoreDetailOutput = null;
    expect(detail).toBeNull();
  });
});

describe("StoreRowOutput type", () => {
  it("accepts a valid row", () => {
    const row: StoreRowOutput = {
      id: 1,
      name: "Branch",
      location: "Floor 1",
      mallName: "Avenues",
      brandName: "Nike",
      companyName: "ACME",
      managerName: "Ali",
    };
    expect(row.name).toBe("Branch");
  });
});

describe("MallsAndBrandsResultOutput type", () => {
  it("accepts a valid result", () => {
    const result: MallsAndBrandsResultOutput = {
      malls: [{ uuid: "u1", name: "Mall" }],
      brands: [],
    };
    expect(result.malls.length).toBe(1);
  });
});

describe("CompanySelectOptionOutput type", () => {
  it("accepts a valid option", () => {
    const opt: CompanySelectOptionOutput = { id: 1, name: "ACME" };
    expect(opt.name).toBe("ACME");
  });
});

// ---------------------------------------------------------------------------
// Zod type inference tests
// ---------------------------------------------------------------------------

describe("inferred types match schemas", () => {
  it("z.input unwraps for listStoresSchema", () => {
    type Input = z.input<typeof listStoresSchema>;
    const valid: Input = {};
    const parsed = listStoresSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("z.output unwraps for getStoreSchema", () => {
    type Output = z.output<typeof getStoreSchema>;
    const valid: Output = { store_id: 1 };
    const parsed = getStoreSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("z.output unwraps for storeListItemOutputSchema", () => {
    type Output = z.output<typeof storeListItemOutputSchema>;
    const valid: Output = {
      store_id: 1,
      store_name: "Branch",
      store_location: "",
      store_status: "active",
      mall_name: null,
      brand_name: null,
      manager_name: null,
    };
    const parsed = storeListItemOutputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
