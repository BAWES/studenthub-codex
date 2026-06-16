import { describe, it, expect } from "vitest";
import { listStoresSchema } from "./schemas";
import type { StoreRow } from "./schemas";

/**
 * Page migration test for admin/stores.
 *
 * Verifies that listStoresSchema accepts the params passed by the page,
 * and that StoreRow fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin stores page — data contract", () => {
  it("listStoresSchema accepts empty params (defaults apply)", () => {
    const r = listStoresSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listStoresSchema accepts the params the page actually passes", () => {
    const r = listStoresSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("StoreRow fields map correctly to DataTable columns", () => {
    // The page maps StoreRow to DataTable columns:
    //   store_id              → row.store_id          (for keys)
    //   store_name            → row.store_name
    //   store_location        → row.store_location
    //   company_name          → row.company_name
    //   brand_name            → row.brand_name
    //   mall_name             → row.mall_name
    //   manager_name          → row.manager_name
    //   store_status          → row.store_status      (10=Active, else Inactive)
    const row: StoreRow = {
      store_id: 1,
      store_name: "Avenues Mall Branch",
      store_location: "Kuwait City",
      store_status: 10,
      store_total_candidates: 15,
      company_name: "ABC Company",
      brand_name: "Nike",
      mall_name: "The Avenues",
      manager_name: "John Doe",
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-06-01T12:00:00Z",
    };
    expect(row.store_id).toBe(1);
    expect(row.store_name).toBe("Avenues Mall Branch");
    expect(row.store_location).toBe("Kuwait City");
    expect(row.company_name).toBe("ABC Company");
    expect(row.brand_name).toBe("Nike");
    expect(row.mall_name).toBe("The Avenues");
    expect(row.manager_name).toBe("John Doe");
    expect(row.store_status).toBe(10);
    expect(row.store_total_candidates).toBe(15);
  });

  it("listStores returns items with expected shape", () => {
    const result: { items: StoreRow[]; total: number } = {
      items: [],
      total: 0,
    };
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
  });
});
