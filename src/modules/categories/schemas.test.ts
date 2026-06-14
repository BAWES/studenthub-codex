import { describe, it, expect } from "vitest";
import {
  categoryListItemSchema,
  listCategoriesResultSchema,
  listCategoriesSchema,
  getCategorySchema,
  createCategorySchema,
  updateCategorySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// categoryListItemSchema
// ---------------------------------------------------------------------------
describe("categoryListItemSchema", () => {
  const valid = {
    category_id: 1,
    name_en: "Technology",
    name_ar: "تقنية",
    image: "https://example.com/cat.png",
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid category list item", () => {
    expect(categoryListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable name_ar", () => {
    expect(
      categoryListItemSchema.safeParse({ ...valid, name_ar: null }).success,
    ).toBe(true);
  });

  it("accepts nullable image", () => {
    expect(
      categoryListItemSchema.safeParse({ ...valid, image: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      categoryListItemSchema.safeParse({ ...valid, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable updated_at", () => {
    expect(
      categoryListItemSchema.safeParse({ ...valid, updated_at: null }).success,
    ).toBe(true);
  });

  it("rejects missing category_id", () => {
    const { category_id: _, ...rest } = valid;
    expect(categoryListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name_en", () => {
    const { name_en: _, ...rest } = valid;
    expect(categoryListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for category_id", () => {
    expect(
      categoryListItemSchema.safeParse({ ...valid, category_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_at", () => {
    expect(
      categoryListItemSchema.safeParse({ ...valid, created_at: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCategoriesResultSchema
// ---------------------------------------------------------------------------
describe("listCategoriesResultSchema", () => {
  const valid = {
    categories: [
      {
        category_id: 1,
        name_en: "Technology",
        name_ar: null,
        image: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listCategoriesResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty categories array", () => {
    expect(
      listCategoriesResultSchema.safeParse({ ...valid, categories: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing categories", () => {
    const { categories: _, ...rest } = valid;
    expect(listCategoriesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listCategoriesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listCategoriesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listCategoriesResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(
      listCategoriesResultSchema.safeParse({ ...valid, limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(
      listCategoriesResultSchema.safeParse({ ...valid, limit: 101 }).success,
    ).toBe(false);
  });

  it("rejects non-array categories", () => {
    expect(
      listCategoriesResultSchema.safeParse({ ...valid, categories: "not-an-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCategoriesSchema (input)
// ---------------------------------------------------------------------------
describe("listCategoriesSchema", () => {
  it("accepts valid params", () => {
    expect(listCategoriesSchema.safeParse({ page: 1, limit: 20 }).success).toBe(true);
  });

  it("accepts empty object with defaults", () => {
    const result = listCategoriesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts string coerce for page", () => {
    const result = listCategoriesSchema.safeParse({ page: "2", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects zero page", () => {
    expect(listCategoriesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCategoriesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCategorySchema
// ---------------------------------------------------------------------------
describe("getCategorySchema", () => {
  it("accepts a valid category ID", () => {
    expect(getCategorySchema.safeParse({ categoryId: 1 }).success).toBe(true);
  });

  it("accepts string coerce", () => {
    const result = getCategorySchema.safeParse({ categoryId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(42);
    }
  });

  it("rejects missing categoryId", () => {
    expect(getCategorySchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive ID", () => {
    expect(getCategorySchema.safeParse({ categoryId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCategorySchema
// ---------------------------------------------------------------------------
describe("createCategorySchema", () => {
  const valid = { nameEn: "Technology", nameAr: "تقنية", image: "https://example.com/img.png" };

  it("accepts valid input", () => {
    expect(createCategorySchema.safeParse(valid).success).toBe(true);
  });

  it("accepts missing optional nameAr", () => {
    const { nameAr: _, ...rest } = valid;
    expect(createCategorySchema.safeParse(rest).success).toBe(true);
  });

  it("accepts missing optional image", () => {
    const { image: _, ...rest } = valid;
    expect(createCategorySchema.safeParse(rest).success).toBe(true);
  });

  it("rejects empty nameEn", () => {
    expect(createCategorySchema.safeParse({ nameEn: "" }).success).toBe(false);
  });

  it("rejects missing nameEn", () => {
    expect(createCategorySchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCategorySchema
// ---------------------------------------------------------------------------
describe("updateCategorySchema", () => {
  it("accepts valid update with all fields", () => {
    expect(
      updateCategorySchema.safeParse({ categoryId: 1, nameEn: "New Name", nameAr: "اسم جديد" })
        .success,
    ).toBe(true);
  });

  it("accepts partial update with only categoryId", () => {
    expect(updateCategorySchema.safeParse({ categoryId: 1 }).success).toBe(true);
  });

  it("rejects missing categoryId", () => {
    expect(updateCategorySchema.safeParse({ nameEn: "Test" }).success).toBe(false);
  });

  it("rejects non-positive categoryId", () => {
    expect(updateCategorySchema.safeParse({ categoryId: 0 }).success).toBe(false);
  });
});
