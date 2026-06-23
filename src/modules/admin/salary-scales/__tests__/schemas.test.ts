import { describe, it, expect } from "vitest";
import {
  salaryScaleListItemSchema,
  listSalaryScalesResultSchema,
  salaryScaleIdResultSchema,
} from "../schemas";

const validSalaryScale = {
  salary_scale_id: 1,
  salary_scale_name_en: "Grade A",
  salary_scale_name_ar: "الدرجة أ",
  salary_scale_min_amount: 500,
  salary_scale_max_amount: 1500,
  candidate_count: 10,
};

describe("salaryScaleListItemSchema", () => {
  it("accepts a valid salary scale with all fields", () => {
    const result = salaryScaleListItemSchema.safeParse(validSalaryScale);
    expect(result.success).toBe(true);
  });

  it("accepts a salary scale with minimal fields (nulls for optionals)", () => {
    const minimal = {
      salary_scale_id: 2,
      salary_scale_name_en: "Grade B",
      salary_scale_name_ar: null,
      salary_scale_min_amount: null,
      salary_scale_max_amount: null,
      candidate_count: null,
    };
    const result = salaryScaleListItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = salaryScaleListItemSchema.safeParse({
      salary_scale_name_en: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer salary_scale_id", () => {
    const result = salaryScaleListItemSchema.safeParse({
      ...validSalaryScale,
      salary_scale_id: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string salary_scale_name_en", () => {
    const result = salaryScaleListItemSchema.safeParse({
      ...validSalaryScale,
      salary_scale_name_en: 123,
    });
    expect(result.success).toBe(false);
  });
});

describe("listSalaryScalesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const result = listSalaryScalesResultSchema.safeParse({
      records: [validSalaryScale],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    const result = listSalaryScalesResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listSalaryScalesResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("salaryScaleIdResultSchema", () => {
  it("accepts a valid salary_scale_id result", () => {
    const result = salaryScaleIdResultSchema.safeParse({ salary_scale_id: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary_scale_id).toBe(42);
    }
  });

  it("rejects non-integer salary_scale_id", () => {
    const result = salaryScaleIdResultSchema.safeParse({ salary_scale_id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing salary_scale_id", () => {
    const result = salaryScaleIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
