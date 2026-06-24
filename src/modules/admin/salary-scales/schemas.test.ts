import { describe, it, expect } from "vitest";
import {
  salaryScaleListItemSchema,
  listSalaryScalesResultSchema,
  createSalaryScaleSchema,
} from "./schemas";

const validItem = {
  salary_scale_id: 1,
  salary_scale_name_en: "Grade 1",
  salary_scale_name_ar: null,
  salary_scale_min_amount: 500,
  salary_scale_max_amount: 1000,
  candidate_count: 10,
};

describe("salaryScaleListItemSchema", () => {
  it("accepts a valid salary scale item", () => {
    const result = salaryScaleListItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const result = salaryScaleListItemSchema.safeParse({
      salary_scale_id: 2,
      salary_scale_name_en: "Grade 2",
      salary_scale_name_ar: null,
      salary_scale_min_amount: null,
      salary_scale_max_amount: null,
      candidate_count: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing salary_scale_id", () => {
    const { salary_scale_id: _, ...rest } = validItem;
    expect(salaryScaleListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("allows empty string salary_scale_name_en (output schema mirrors DB)", () => {
    expect(
      salaryScaleListItemSchema.safeParse({ ...validItem, salary_scale_name_en: "" })
        .success,
    ).toBe(true);
  });

  it("rejects missing salary_scale_name_en", () => {
    const { salary_scale_name_en: _, ...rest } = validItem;
    expect(salaryScaleListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer salary_scale_id", () => {
    expect(
      salaryScaleListItemSchema.safeParse({ ...validItem, salary_scale_id: "abc" })
        .success,
    ).toBe(false);
  });
});

describe("listSalaryScalesResultSchema", () => {
  const validResult = {
    records: [validItem],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid list result with items", () => {
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
});

describe("createSalaryScaleSchema", () => {
  it("accepts valid creation input with all fields", () => {
    const result = createSalaryScaleSchema.safeParse({
      salary_scale_name_en: "Grade 1",
      salary_scale_name_ar: "الدرجة الأولى",
      salary_scale_min_amount: "500",
      salary_scale_max_amount: "1000",
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
});
