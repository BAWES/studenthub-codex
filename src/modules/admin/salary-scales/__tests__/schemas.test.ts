import { describe, it, expect } from "vitest";
import {
  salaryScaleItemSchema,
  listSalaryScalesResultSchema,
  salaryScaleIdResultSchema,
  createSalaryScaleInputSchema,
  updateSalaryScaleInputSchema,
} from "../schemas";

const validSalaryScale = {
  salary_scale_id: 1,
  salary_scale_name_en: "Entry Level",
  salary_scale_name_ar: "مبتدئ",
  salary_scale_min_amount: 300,
  salary_scale_max_amount: 800,
  candidate_count: 0,
};

describe("salaryScaleItemSchema", () => {
  it("accepts a valid salary scale with all fields", () => {
    const result = salaryScaleItemSchema.safeParse(validSalaryScale);
    expect(result.success).toBe(true);
  });

  it("accepts a salary scale with minimal fields (nulls for optionals)", () => {
    const minimal = {
      salary_scale_id: 2,
      salary_scale_name_en: "Senior",
      salary_scale_name_ar: null,
      salary_scale_min_amount: null,
      salary_scale_max_amount: null,
      candidate_count: null,
    };
    const result = salaryScaleItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing required salary_scale_name_en", () => {
    const result = salaryScaleItemSchema.safeParse({
      salary_scale_id: 1,
      salary_scale_name_en: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer salary_scale_id", () => {
    const result = salaryScaleItemSchema.safeParse({
      ...validSalaryScale,
      salary_scale_id: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric min amount", () => {
    const result = salaryScaleItemSchema.safeParse({
      ...validSalaryScale,
      salary_scale_min_amount: "not-a-number",
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
  it("accepts a valid id result", () => {
    const result = salaryScaleIdResultSchema.safeParse({ salary_scale_id: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary_scale_id).toBe(42);
    }
  });

  it("rejects non-integer id", () => {
    const result = salaryScaleIdResultSchema.safeParse({ salary_scale_id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = salaryScaleIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createSalaryScaleInputSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createSalaryScaleInputSchema.safeParse({
      salary_scale_name_en: "Junior",
      salary_scale_name_ar: "مبتدئ",
      salary_scale_min_amount: 200,
      salary_scale_max_amount: 500,
    });
    expect(result.success).toBe(true);
  });

  it("accepts input with only required fields", () => {
    const result = createSalaryScaleInputSchema.safeParse({
      salary_scale_name_en: "Junior",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary_scale_name_ar).toBe("");
      expect(result.data.salary_scale_min_amount).toBeUndefined();
    }
  });

  it("rejects empty name", () => {
    const result = createSalaryScaleInputSchema.safeParse({
      salary_scale_name_en: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    const result = createSalaryScaleInputSchema.safeParse({
      salary_scale_name_en: "X".repeat(256),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateSalaryScaleInputSchema", () => {
  it("accepts valid update with partial fields", () => {
    const result = updateSalaryScaleInputSchema.safeParse({
      salary_scale_id: 1,
      salary_scale_name_en: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("rejects update without id", () => {
    const result = updateSalaryScaleInputSchema.safeParse({
      salary_scale_name_en: "Updated Name",
    });
    expect(result.success).toBe(false);
  });

  it("rejects update with non-integer id", () => {
    const result = updateSalaryScaleInputSchema.safeParse({
      salary_scale_id: "abc",
      salary_scale_name_en: "Updated Name",
    });
    expect(result.success).toBe(false);
  });
});
