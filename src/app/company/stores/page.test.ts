import { describe, it, expect } from "vitest";
import {
  storeListItemOutputSchema,
  listStoresResultOutputSchema,
  storeDetailOutputSchema,
  storeRowOutputSchema,
  mallsAndBrandsResultOutputSchema,
  companySelectOptionOutputSchema,
} from "./schemas";

describe("company stores page — data contract", () => {
  it("storeListItemOutputSchema validates a valid store list item", () => {
    const r = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Downtown Store",
      store_location: "Floor 2, Mall A",
      store_status: "active",
      mall_name: "The Avenues",
      brand_name: "Nike",
      manager_name: "John Doe",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.store_name).toBe("Downtown Store");
  });

  it("storeListItemOutputSchema rejects missing store_id", () => {
    const r = storeListItemOutputSchema.safeParse({ store_name: "Store" });
    expect(r.success).toBe(false);
  });

  it("storeListItemOutputSchema accepts null for nullable fields", () => {
    const r = storeListItemOutputSchema.safeParse({
      store_id: 1,
      store_name: "Store",
      store_location: "Location",
      store_status: "inactive",
      mall_name: null,
      brand_name: null,
      manager_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("listStoresResultOutputSchema validates a paginated result", () => {
    const r = listStoresResultOutputSchema.safeParse({
      stores: [
        {
          store_id: 1, store_name: "A", store_location: "Loc",
          store_status: "active", mall_name: null, brand_name: null,
          manager_name: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.stores.length).toBe(1);
  });

  it("listStoresResultOutputSchema rejects non-array stores", () => {
    const r = listStoresResultOutputSchema.safeParse({
      stores: "bad",
      total: 0, page: 0, limit: 0, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("storeDetailOutputSchema validates a store detail", () => {
    const r = storeDetailOutputSchema.safeParse({
      store_id: 1,
      store_name: "Downtown Store",
      store_location: "Floor 2, Mall A",
      store_status: "active",
      company_id: 1,
      company_name: "Tech Corp",
      mall_name: "The Avenues",
      brand_name: "Nike",
      manager_name: "John Doe",
      manager_email: "john@example.com",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-06-01T00:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("storeDetailOutputSchema accepts null", () => {
    const r = storeDetailOutputSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("storeRowOutputSchema validates a valid DataTable row", () => {
    const r = storeRowOutputSchema.safeParse({
      id: 1,
      name: "Downtown Store",
      location: "Floor 2, Mall A",
      mallName: "The Avenues",
      brandName: "Nike",
      companyName: "Tech Corp",
      managerName: "John Doe",
    });
    expect(r.success).toBe(true);
  });

  it("storeRowOutputSchema rejects missing id", () => {
    const r = storeRowOutputSchema.safeParse({ name: "Store" });
    expect(r.success).toBe(false);
  });

  it("mallsAndBrandsResultOutputSchema validates malls and brands", () => {
    const r = mallsAndBrandsResultOutputSchema.safeParse({
      malls: [{ uuid: "m-1", name: "The Avenues" }],
      brands: [{ uuid: "b-1", name: "Nike" }],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.malls.length).toBe(1);
  });

  it("companySelectOptionOutputSchema validates a company option", () => {
    const r = companySelectOptionOutputSchema.safeParse({
      id: 1,
      name: "Tech Corp",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Tech Corp");
  });
});
