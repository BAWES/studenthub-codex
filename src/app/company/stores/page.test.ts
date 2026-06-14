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

/**
 * Page migration test for company/stores.
 *
 * Verifies the data contract between page and action.
 * The stores page lists company stores with CRUD operations.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("company stores page — data contract", () => {
  // ---------------------------------------------------------------------------
  // listStoresSchema (input)
  // ---------------------------------------------------------------------------
  it("listStoresSchema accepts empty input", () => {
    const r = listStoresSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("listStoresSchema accepts explicit values", () => {
    const r = listStoresSchema.safeParse({
      page: 1,
      limit: 50,
      company_id: 5,
      store_status: 1,
    });
    expect(r.success).toBe(true);
  });

  it("listStoresSchema rejects zero page", () => {
    const r = listStoresSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("listStoresSchema rejects limit above 100", () => {
    const r = listStoresSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // getStoreSchema (input)
  // ---------------------------------------------------------------------------
  it("getStoreSchema accepts valid store_id", () => {
    const r = getStoreSchema.safeParse({ store_id: 42 });
    expect(r.success).toBe(true);
  });

  it("getStoreSchema rejects missing store_id", () => {
    const r = getStoreSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getStoreSchema rejects zero store_id", () => {
    const r = getStoreSchema.safeParse({ store_id: 0 });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // listStoresRowsSchema (input)
  // ---------------------------------------------------------------------------
  it("listStoresRowsSchema accepts valid contactUuid", () => {
    const r = listStoresRowsSchema.safeParse({ contactUuid: "contact-123" });
    expect(r.success).toBe(true);
  });

  it("listStoresRowsSchema rejects missing contactUuid", () => {
    const r = listStoresRowsSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // listMallsAndBrandsSchema (input)
  // ---------------------------------------------------------------------------
  it("listMallsAndBrandsSchema accepts valid contactUuid", () => {
    const r = listMallsAndBrandsSchema.safeParse({
      contactUuid: "contact-1",
    });
    expect(r.success).toBe(true);
  });

  it("listMallsAndBrandsSchema rejects missing contactUuid", () => {
    const r = listMallsAndBrandsSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // listCompanySelectOptionsSchema (input)
  // ---------------------------------------------------------------------------
  it("listCompanySelectOptionsSchema accepts valid contactUuid", () => {
    const r = listCompanySelectOptionsSchema.safeParse({
      contactUuid: "contact-1",
    });
    expect(r.success).toBe(true);
  });

  it("listCompanySelectOptionsSchema rejects missing contactUuid", () => {
    const r = listCompanySelectOptionsSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // storeListItemOutputSchema (output)
  // ---------------------------------------------------------------------------
  it("storeListItemOutputSchema accepts valid item", () => {
    const r = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Main Store",
      store_location: "Floor 1",
      store_status: "active",
      mall_name: null,
      brand_name: null,
      manager_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("storeListItemOutputSchema accepts inactive status", () => {
    const r = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Main Store",
      store_location: "Floor 1",
      store_status: "inactive",
      mall_name: null,
      brand_name: null,
      manager_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("storeListItemOutputSchema accepts non-null values", () => {
    const r = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Main Store",
      store_location: "Floor 1",
      store_status: "active",
      mall_name: "The Mall",
      brand_name: "Nike",
      manager_name: "John",
    });
    expect(r.success).toBe(true);
  });

  it("storeListItemOutputSchema rejects invalid status", () => {
    const r = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Main Store",
      store_location: "Floor 1",
      store_status: "unknown",
      mall_name: null,
      brand_name: null,
      manager_name: null,
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // listStoresResultOutputSchema (output)
  // ---------------------------------------------------------------------------
  it("listStoresResultOutputSchema accepts valid result", () => {
    const r = listStoresResultOutputSchema.safeParse({
      stores: [
        {
          store_id: 1,
          store_name: "Main Store",
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
    expect(r.success).toBe(true);
  });

  it("listStoresResultOutputSchema accepts empty stores", () => {
    const r = listStoresResultOutputSchema.safeParse({
      stores: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("listStoresResultOutputSchema rejects negative total", () => {
    const r = listStoresResultOutputSchema.safeParse({
      stores: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // storeDetailOutputSchema (output, nullable)
  // ---------------------------------------------------------------------------
  it("storeDetailOutputSchema accepts valid detail", () => {
    const r = storeDetailOutputSchema.safeParse({
      store_id: 1,
      store_name: "Main Store",
      store_location: "Floor 1",
      store_status: "active",
      company_id: null,
      company_name: null,
      mall_name: null,
      brand_name: null,
      manager_name: null,
      manager_email: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-15",
    });
    expect(r.success).toBe(true);
  });

  it("storeDetailOutputSchema accepts null", () => {
    const r = storeDetailOutputSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("storeDetailOutputSchema rejects missing store_name", () => {
    const r = storeDetailOutputSchema.safeParse({
      store_id: 1,
      store_location: "Floor 1",
      store_status: "active",
      company_id: null,
      company_name: null,
      mall_name: null,
      brand_name: null,
      manager_name: null,
      manager_email: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-15",
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // storeRowOutputSchema (output)
  // ---------------------------------------------------------------------------
  it("storeRowOutputSchema accepts valid row", () => {
    const r = storeRowOutputSchema.safeParse({
      id: 1,
      name: "Main Store",
      location: "Floor 1",
      mallName: "The Mall",
      brandName: "Nike",
      companyName: "Test Corp",
      managerName: "John",
    });
    expect(r.success).toBe(true);
  });

  it("storeRowOutputSchema rejects missing name", () => {
    const r = storeRowOutputSchema.safeParse({
      id: 1,
      location: "Floor 1",
      mallName: "The Mall",
      brandName: "Nike",
      companyName: "Test Corp",
      managerName: "John",
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // mallsAndBrandsResultOutputSchema (output)
  // ---------------------------------------------------------------------------
  it("mallsAndBrandsResultOutputSchema accepts valid result", () => {
    const r = mallsAndBrandsResultOutputSchema.safeParse({
      malls: [{ uuid: "mall-1", name: "The Mall" }],
      brands: [{ uuid: "brand-1", name: "Nike" }],
    });
    expect(r.success).toBe(true);
  });

  it("mallsAndBrandsResultOutputSchema accepts empty arrays", () => {
    const r = mallsAndBrandsResultOutputSchema.safeParse({
      malls: [],
      brands: [],
    });
    expect(r.success).toBe(true);
  });

  it("mallsAndBrandsResultOutputSchema rejects missing malls", () => {
    const r = mallsAndBrandsResultOutputSchema.safeParse({
      brands: [],
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // companySelectOptionOutputSchema (output)
  // ---------------------------------------------------------------------------
  it("companySelectOptionOutputSchema accepts valid option", () => {
    const r = companySelectOptionOutputSchema.safeParse({
      id: 1,
      name: "Test Corp",
    });
    expect(r.success).toBe(true);
  });

  it("companySelectOptionOutputSchema rejects missing name", () => {
    const r = companySelectOptionOutputSchema.safeParse({ id: 1 });
    expect(r.success).toBe(false);
  });
});
