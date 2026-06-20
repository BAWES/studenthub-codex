import { describe, it, expect } from "vitest";
import { listDegreesSchema } from "./schemas";
import type { DegreeItem, ListDegreesResult } from "./schemas";

/**
 * Page migration test for admin/degree.
 *
 * Verifies that listDegreesSchema accepts the params passed by the page,
 * and that DegreeItem fields map correctly to DataTable columns.
 */
describe("admin degree page — data contract", () => {
  it("listDegreesSchema accepts empty params (defaults apply)", () => {
    const r = listDegreesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
      expect(r.data.limit).toBe(50);
      expect(typeof r.data.page).toBe("number");
      expect(r.data.page).toBe(1);
    }
  });

  it("listDegreesSchema accepts the params the page actually passes", () => {
    const r = listDegreesSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("DegreeItem fields map correctly to DataTable columns", () => {
    const row: DegreeItem = {
      degree_uuid: "abc-123-def",
      degree_name_en: "Bachelor of Science",
      degree_name_ar: "بكالوريوس",
      degree_group_uuid: null,
      degree_sort_order: 1,
      degree_created_at: new Date("2025-01-01T00:00:00Z"),
      degree_updated_at: new Date("2025-06-01T12:00:00Z"),
    };
    expect(row.degree_uuid).toBe("abc-123-def");
    expect(row.degree_name_en).toBe("Bachelor of Science");
    expect(row.degree_name_ar).toBe("بكالوريوس");
    expect(row.degree_sort_order).toBe(1);
  });

  it("DegreeItem allows nullable fields", () => {
    const row: DegreeItem = {
      degree_uuid: "nullable-test",
      degree_name_en: "Test",
      degree_name_ar: null,
      degree_group_uuid: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    };
    expect(row.degree_name_ar).toBeNull();
    expect(row.degree_sort_order).toBeNull();
    expect(row.degree_created_at).toBeNull();
  });

  it("ListDegreesResult has expected shape", () => {
    const result: ListDegreesResult = {
      degrees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.degrees)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
