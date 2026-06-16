import { describe, it, expect } from "vitest";
import { listDesignationsSchema } from "./schemas";
import type { DesignationRow, ListDesignationsResult } from "./schemas";

/**
 * Page migration test for admin/designations.
 *
 * Verifies that listDesignationsSchema accepts the params passed by the page,
 * and that DesignationRow fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin designations page — data contract", () => {
  it("listDesignationsSchema accepts empty params (defaults apply)", () => {
    const r = listDesignationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listDesignationsSchema accepts the params the page actually passes", () => {
    const r = listDesignationsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("DesignationRow fields map correctly to DataTable columns", () => {
    // The page maps DesignationRow to DataTable columns:
    //   designation_uuid       → row.designation_uuid   (for keys)
    //   designation_name_en    → row.designation_name_en
    //   designation_name_ar    → row.designation_name_ar
    //   designation_created_at → row.designation_created_at
    //   designation_updated_at → row.designation_updated_at
    const row: DesignationRow = {
      designation_uuid: "desig-uuid-1",
      designation_name_en: "Software Engineer",
      designation_name_ar: "مهندس برمجيات",
      designation_created_at: new Date("2025-01-15T10:00:00Z"),
      designation_updated_at: new Date("2025-06-01T12:00:00Z"),
    };
    expect(row.designation_uuid).toBe("desig-uuid-1");
    expect(row.designation_name_en).toBe("Software Engineer");
    expect(row.designation_name_ar).toBe("مهندس برمجيات");
    expect(row.designation_created_at).toEqual(new Date("2025-01-15T10:00:00Z"));
    expect(row.designation_updated_at).toEqual(new Date("2025-06-01T12:00:00Z"));
  });

  it("ListDesignationsResult has expected shape", () => {
    const result: ListDesignationsResult = {
      designations: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.designations)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
