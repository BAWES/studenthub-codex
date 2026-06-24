import { describe, it, expect } from "vitest";
import {
  salaryScaleListItemSchema,
  listSalaryScalesResultSchema,
  createSalaryScaleSchema,
} from "./schemas";
import type {
  SalaryScaleListItem,
  ListSalaryScalesResult,
} from "./schemas";

describe("salaryScaleListItemSchema", () => {
  const validItem = {
    salary_scale_id: 1,
    salary_scale_name_en: "Grade 1",
    salary_scale_name_ar: null,
    salary_scale_min_amount: 500,
    salary_scale_max_amount: 1000,
    candidate_count: null,
  };

  it("accepts a valid salary scale item", () => {
    expect(salaryScaleListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      salaryScaleListItemSchema.safeParse({
        ...validItem,
        salary_scale_name_ar: null,
        salary_scale_min_amount: null,
        salary_scale_max_amount: null,
        candidate_count: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing salary_scale_id", () => {
    const { salary_scale_id: _, ...rest } = validItem;
    expect(salaryScaleListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative salary_scale_id", () => {
    expect(
      salaryScaleListItemSchema.safeParse({ ...validItem, salary_scale_id: -1 })
        .success,
    ).toBe(false);
  });

  it("accepts empty salary_scale_name_en (DB may return empty)", () => {
    expect(
      salaryScaleListItemSchema.safeParse({ ...validItem, salary_scale_name_en: "" })
        .success,
    ).toBe(true);
  });

  it("rejects missing salary_scale_name_en", () => {
    const { salary_scale_name_en: _, ...rest } = validItem;
    expect(salaryScaleListItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listSalaryScalesResultSchema", () => {
  const validResult = {
    records: [
      {
        salary_scale_id: 1,
        salary_scale_name_en: "Grade 1",
        salary_scale_name_ar: null,
        salary_scale_min_amount: null,
        salary_scale_max_amount: null,
        candidate_count: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid list result with records", () => {
    expect(listSalaryScalesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty records array", () => {
    expect(
      listSalaryScalesResultSchema.safeParse({
        ...validResult,
        records: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing records", () => {
    const { records: _, ...rest } = validResult;
    expect(listSalaryScalesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listSalaryScalesResultSchema.safeParse({ ...validResult, total: -1 })
        .success,
    ).toBe(false);
  });

  it("rejects non-array records", () => {
    expect(
      listSalaryScalesResultSchema.safeParse({ ...validResult, records: "not-array" })
        .success,
    ).toBe(false);
  });
});

describe("createSalaryScaleSchema", () => {
  it("accepts valid creation input with all fields", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "Grade 1",
      salary_scale_name_ar: "الدرجة الأولى",
      salary_scale_min_amount: 500,
      salary_scale_max_amount: 1000,
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
      salary_scale_min_amount: "500",
      salary_scale_max_amount: "1000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary_scale_min_amount).toBe(500);
      expect(result.data.salary_scale_max_amount).toBe(1000);
    }
  });

  it("defaults salary_scale_name_ar to empty string", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "Test",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary_scale_name_ar).toBe("");
    }
  });
});
