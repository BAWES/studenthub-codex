import { describe, it, expect } from "vitest";
import {
  salaryScaleItemSchema,
  listSalaryScalesResultSchema,
  createSalaryScaleSchema,
} from "./schemas";
import type { SalaryScaleItem, ListSalaryScalesResult } from "./schemas";

describe("salaryScaleItemSchema", () => {
  const validItem = {
    salary_scale_uuid: "scale-001",
    salary_scale_name_en: "Grade 1",
    salary_scale_name_ar: null,
    salary_scale_min_salary: 500,
    salary_scale_mid_salary: 750,
    salary_scale_max_salary: 1000,
    salary_scale_currency: "KWD",
    salary_scale_sort_order: 1,
    salary_scale_created_at: new Date("2026-01-01"),
    salary_scale_updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid salary scale item", () => {
    expect(salaryScaleItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      salaryScaleItemSchema.safeParse({
        ...validItem,
        salary_scale_name_ar: null,
        salary_scale_min_salary: null,
        salary_scale_mid_salary: null,
        salary_scale_max_salary: null,
        salary_scale_currency: null,
        salary_scale_sort_order: null,
        salary_scale_created_at: null,
        salary_scale_updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing salary_scale_uuid", () => {
    const { salary_scale_uuid: _, ...rest } = validItem;
    expect(salaryScaleItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty salary_scale_name_en", () => {
    expect(
      salaryScaleItemSchema.safeParse({ ...validItem, salary_scale_name_en: "" })
        .success,
    ).toBe(false);
  });

  it("rejects missing salary_scale_name_en", () => {
    const { salary_scale_name_en: _, ...rest } = validItem;
    expect(salaryScaleItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listSalaryScalesResultSchema", () => {
  const validResult = {
    items: [
      {
        salary_scale_uuid: "scale-001",
        salary_scale_name_en: "Grade 1",
        salary_scale_name_ar: null,
        salary_scale_min_salary: null,
        salary_scale_mid_salary: null,
        salary_scale_max_salary: null,
        salary_scale_currency: null,
        salary_scale_sort_order: 1,
        salary_scale_created_at: new Date("2026-01-01"),
        salary_scale_updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid list result with items", () => {
    expect(listSalaryScalesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listSalaryScalesResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listSalaryScalesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listSalaryScalesResultSchema.safeParse({ ...validResult, total: -1 })
        .success,
    ).toBe(false);
  });
});

describe("createSalaryScaleSchema", () => {
  it("accepts valid creation input with all fields", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "Grade 1",
      salary_scale_name_ar: "الدرجة الأولى",
      salary_scale_min_salary: 500,
      salary_scale_mid_salary: 750,
      salary_scale_max_salary: 1000,
      salary_scale_currency: "KWD",
      salary_scale_sort_order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal input (name only)", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "Grade 1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty english name", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too long english name", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers to actual numbers", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "Test",
      salary_scale_min_salary: "500",
      salary_scale_sort_order: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary_scale_min_salary).toBe(500);
      expect(result.data.salary_scale_sort_order).toBe(3);
    }
  });

  it("defaults currency to KWD", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "Test",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary_scale_currency).toBe("KWD");
    }
  });
});
