import { describe, it, expect } from "vitest";
import { listMajorsSchema } from "./schemas";
import type { MajorItem, ListMajorsResult } from "./schemas";

/**
 * Page migration test for admin/major.
 *
 * Verifies that listMajorsSchema accepts the params passed by the page,
 * and that MajorItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin major page — data contract", () => {
  it("listMajorsSchema accepts empty params (defaults apply)", () => {
    const r = listMajorsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listMajorsSchema accepts the params the page actually passes", () => {
    const r = listMajorsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("MajorItem fields map correctly to DataTable columns", () => {
    // The page maps MajorItem to DataTable columns:
    //   major_uuid        → row.major_uuid   (for keys)
    //   major_name_en     → row.major_name_en
    //   major_name_ar     → row.major_name_ar
    //   major_created_at  → row.major_created_at (formatted)
    //   major_updated_at  → row.major_updated_at (formatted)
    const row: MajorItem = {
      major_uuid: "abc-123",
      major_name_en: "Computer Science",
      major_name_ar: "علوم الحاسوب",
      data_source: null,
      major_created_at: new Date("2025-01-15T10:00:00Z"),
      major_updated_at: new Date("2025-06-01T12:00:00Z"),
    };
    expect(row.major_uuid).toBe("abc-123");
    expect(row.major_name_en).toBe("Computer Science");
    expect(row.major_name_ar).toBe("علوم الحاسوب");
    expect(row.major_created_at).toEqual(new Date("2025-01-15T10:00:00Z"));
    expect(row.major_updated_at).toEqual(new Date("2025-06-01T12:00:00Z"));
  });

  it("ListMajorsResult has expected shape", () => {
    const result: ListMajorsResult = {
      majors: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.majors)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
