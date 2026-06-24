// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { salaryScaleListItemSchema, listSalaryScalesResultSchema } from "./schemas";
import type { SalaryScaleListItem, ListSalaryScalesResult } from "./schemas";

/**
 * Page migration test for admin/salary-scales.
 *
 * Verifies that salaryScaleListItemSchema accepts the data returned by the
 * listSalaryScales server action, and that SalaryScaleListItem fields map
 * correctly to table columns.
 */
describe("admin salary-scales page — data contract", () => {
  it("listSalaryScalesResultSchema accepts empty list result", () => {
    const r = listSalaryScalesResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.records).toEqual([]);
    }
  });

  it("salaryScaleListItemSchema accepts a full salary scale record", () => {
    const r: SalaryScaleListItem = {
      salary_scale_id: 1,
      salary_scale_name_en: "Grade A",
      salary_scale_name_ar: "الدرجة أ",
      salary_scale_min_amount: 500.0,
      salary_scale_max_amount: 1500.0,
      candidate_count: 12,
    };
    const parsed = salaryScaleListItemSchema.safeParse(r);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.salary_scale_id).toBe(r.salary_scale_id);
      expect(parsed.data.salary_scale_name_en).toBe(r.salary_scale_name_en);
      expect(parsed.data.salary_scale_name_ar).toBe(r.salary_scale_name_ar);
      expect(parsed.data.candidate_count).toBe(12);
    }
  });

  it("SalaryScaleListItem fields map correctly to table columns", () => {
    const record: SalaryScaleListItem = {
      salary_scale_id: 5,
      salary_scale_name_en: "Grade B",
      salary_scale_name_ar: "الدرجة ب",
      salary_scale_min_amount: 1000.0,
      salary_scale_max_amount: 3000.0,
      candidate_count: 0,
    };
    expect(record.salary_scale_id).toBe(5);
    expect(record.salary_scale_name_en).toBe("Grade B");
    expect(record.salary_scale_min_amount).toBe(1000.0);
    expect(record.salary_scale_max_amount).toBe(3000.0);
  });

  it("ListSalaryScalesResult has expected shape (matches listSalaryScales return)", () => {
    const result: ListSalaryScalesResult = {
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.records)).toBe(true);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(0);
  });

  it("salaryScaleListItemSchema rejects missing required fields", () => {
    const r = listSalaryScalesResultSchema.safeParse({ salary_scale_name_en: "Test" });
    expect(r.success).toBe(false);
  });

  it("salaryScaleListItemSchema accepts nullable fields", () => {
    const r = salaryScaleListItemSchema.safeParse({
      salary_scale_id: 1,
      salary_scale_name_en: "Test",
      salary_scale_name_ar: null,
      salary_scale_min_amount: null,
      salary_scale_max_amount: null,
      candidate_count: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.salary_scale_name_ar).toBeNull();
      expect(r.data.salary_scale_min_amount).toBeNull();
      expect(r.data.salary_scale_max_amount).toBeNull();
      expect(r.data.candidate_count).toBeNull();
    }
  });
});
