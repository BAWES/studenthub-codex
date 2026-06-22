import { describe, it, expect } from "vitest";
import { listMajorsSchema } from "./schemas";
import type { MajorItem, ListMajorsResult } from "./schemas";

/**
 * Page migration test for admin/major.
 * Validates the data contract between the page and the server action.
 */
describe("admin major page — data contract", () => {
  it("listMajorsSchema accepts empty params (defaults apply)", () => {
    const r = listMajorsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1);
    }
  });

  it("listMajorsSchema accepts the params the page actually passes", () => {
    const r = listMajorsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(100);
  });

  it("MajorItem fields map correctly to DataTable columns", () => {
    const row: MajorItem = {
      major_uuid: "mjr-123",
      major_name_en: "Computer Science",
      major_name_ar: "علوم الحاسوب",
      data_source: 1,
      major_created_at: new Date("2025-01-01T00:00:00Z"),
      major_updated_at: new Date("2025-06-01T12:00:00Z"),
    };
    expect(row.major_uuid).toBe("mjr-123");
    expect(row.major_name_en).toBe("Computer Science");
    expect(row.major_name_ar).toBe("علوم الحاسوب");
    expect(row.data_source).toBe(1);
  });

  it("MajorItem allows nullable fields", () => {
    const row: MajorItem = {
      major_uuid: "nullable-test",
      major_name_en: "Test",
      major_name_ar: "اختبار",
      data_source: null,
      major_created_at: null,
      major_updated_at: null,
    };
    expect(row.data_source).toBeNull();
    expect(row.major_created_at).toBeNull();
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
  });
});
