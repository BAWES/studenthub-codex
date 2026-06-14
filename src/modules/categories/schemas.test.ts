import { describe, it, expect } from "vitest";
import {
  categoryListItemSchema,
  listCategoriesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// categoryListItemSchema tests
// ---------------------------------------------------------------------------

describe("categoryListItemSchema", () => {
  it("should accept a valid category item with all fields", () => {
    const data = {
      category_id: 1,
      name_en: "Training",
      name_ar: "تدريب",
      image: "https://example.com/img.png",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-06-15"),
    };
    const result = categoryListItemSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept nullable fields as null", () => {
    const data = {
      category_id: 2,
      name_en: "Workshop",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    };
    const result = categoryListItemSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject missing category_id", () => {
    const data = {
      name_en: "Training",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    };
    const result = categoryListItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-number category_id", () => {
    const data = {
      category_id: "abc",
      name_en: "Training",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    };
    const result = categoryListItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-string name_en", () => {
    const data = {
      category_id: 1,
      name_en: 123,
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    };
    const result = categoryListItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-boolean-like values for date fields", () => {
    const data = {
      category_id: 1,
      name_en: "Training",
      name_ar: null,
      image: null,
      created_at: "not-a-date",
      updated_at: null,
    };
    const result = categoryListItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCategoriesResultSchema tests
// ---------------------------------------------------------------------------

describe("listCategoriesResultSchema", () => {
  const validCategory = {
    category_id: 1,
    name_en: "Training",
    name_ar: null,
    image: null,
    created_at: null,
    updated_at: null,
  };

  it("should accept a valid result with categories", () => {
    const data = {
      categories: [validCategory],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const result = listCategoriesResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept an empty categories array", () => {
    const data = {
      categories: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listCategoriesResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject missing total", () => {
    const data = {
      categories: [validCategory],
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const result = listCategoriesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject negative total", () => {
    const data = {
      categories: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listCategoriesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-positive page", () => {
    const data = {
      categories: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    };
    const result = listCategoriesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject limit above 100", () => {
    const data = {
      categories: [],
      total: 0,
      page: 1,
      limit: 101,
      totalPages: 0,
    };
    const result = listCategoriesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject limit below 1", () => {
    const data = {
      categories: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    };
    const result = listCategoriesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-array categories", () => {
    const data = {
      categories: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listCategoriesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
