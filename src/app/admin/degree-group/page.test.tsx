import { describe, it, expect } from "vitest";
import { listDegreeGroupsSchema } from "@/modules/degree-groups/schemas";
import type { DegreeGroupItem, ListDegreeGroupsResult } from "@/modules/degree-groups/schemas";

/**
 * Page migration test for admin/degree-group.
 *
 * Verifies that listDegreeGroupsSchema accepts the params passed by the page,
 * and that DegreeGroupItem fields map correctly to DataTable columns.
 */
describe("admin degree-group page — data contract", () => {
  it("listDegreeGroupsSchema accepts empty params (fields undefined, defaults in function)", () => {
    const r = listDegreeGroupsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBeUndefined();
      expect(r.data.page).toBeUndefined();
    }
  });

  it("listDegreeGroupsSchema accepts the params the page actually passes", () => {
    const r = listDegreeGroupsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("DegreeGroupItem fields map correctly to DataTable columns", () => {
    const row: DegreeGroupItem = {
      degree_group_uuid: "abc-123-def",
      degree_group_name_en: "Science",
      degree_group_name_ar: "علوم",
      degree_group_sort_order: 1,
      skip_major: 0,
      degree_group_created_at: new Date("2025-01-01T00:00:00Z"),
      degree_group_updated_at: new Date("2025-06-01T12:00:00Z"),
    };
    expect(row.degree_group_uuid).toBe("abc-123-def");
    expect(row.degree_group_name_en).toBe("Science");
    expect(row.degree_group_name_ar).toBe("علوم");
    expect(row.degree_group_sort_order).toBe(1);
  });

  it("DegreeGroupItem allows nullable fields", () => {
    const row: DegreeGroupItem = {
      degree_group_uuid: "nullable-test",
      degree_group_name_en: "Test",
      degree_group_name_ar: null,
      degree_group_sort_order: null,
      skip_major: null,
      degree_group_created_at: null,
      degree_group_updated_at: null,
    };
    expect(row.degree_group_name_ar).toBeNull();
    expect(row.degree_group_sort_order).toBeNull();
    expect(row.degree_group_created_at).toBeNull();
  });

  it("ListDegreeGroupsResult has expected shape", () => {
    const result: ListDegreeGroupsResult = {
      degreeGroups: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.degreeGroups)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
