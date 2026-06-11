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
// Schema validation tests for DiscountCategoryController server actions
//
// Tests avoid mocking "use server" dependencies (prisma, session) by
// testing Zod schemas — the pure validation layer — in isolation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listCategoriesSchema tests
// ---------------------------------------------------------------------------

describe("listCategoriesSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listCategoriesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listCategoriesSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects zero page", () => {
    const result = listCategoriesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCategoriesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCategoriesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listCategoriesSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const result = listCategoriesSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });
});

// ---------------------------------------------------------------------------
// getCategorySchema tests
// ---------------------------------------------------------------------------

describe("getCategorySchema", () => {
  it("accepts a valid category ID", () => {
    const result = getCategorySchema.safeParse({ categoryId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(42);
    }
  });

  it("rejects zero category ID", () => {
    const result = getCategorySchema.safeParse({ categoryId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative category ID", () => {
    const result = getCategorySchema.safeParse({ categoryId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing categoryId", () => {
    const result = getCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces string category ID to number", () => {
    const result = getCategorySchema.safeParse({ categoryId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(7);
    }
  });
});

// ---------------------------------------------------------------------------
// createCategorySchema tests
// ---------------------------------------------------------------------------

describe("createCategorySchema", () => {
  it("accepts valid category with required fields only", () => {
    const result = createCategorySchema.safeParse({
      nameEn: "Scholarships",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameEn).toBe("Scholarships");
      expect(result.data.nameAr).toBeUndefined();
      expect(result.data.image).toBeUndefined();
    }
  });

  it("accepts category with all fields", () => {
    const result = createCategorySchema.safeParse({
      nameEn: "Discounts",
      nameAr: "الخصومات",
      image: "https://cdn.example.com/discounts.png",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameEn).toBe("Discounts");
      expect(result.data.nameAr).toBe("الخصومات");
      expect(result.data.image).toBe("https://cdn.example.com/discounts.png");
    }
  });

  it("rejects missing nameEn", () => {
    const result = createCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty nameEn", () => {
    const result = createCategorySchema.safeParse({ nameEn: "" });
    expect(result.success).toBe(false);
  });

  it("accepts empty nameAr as optional", () => {
    const result = createCategorySchema.safeParse({ nameEn: "Test", nameAr: "" });
    expect(result.success).toBe(true);
  });

  it("accepts empty image as optional", () => {
    const result = createCategorySchema.safeParse({ nameEn: "Test", image: "" });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateCategorySchema tests
// ---------------------------------------------------------------------------

describe("updateCategorySchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: 42,
      nameEn: "Updated Name",
      nameAr: "الاسم المحدث",
      image: "https://cdn.example.com/new.png",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(42);
      expect(result.data.nameEn).toBe("Updated Name");
      expect(result.data.nameAr).toBe("الاسم المحدث");
      expect(result.data.image).toBe("https://cdn.example.com/new.png");
    }
  });

  it("accepts partial update (only categoryId + one field)", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: 42,
      nameEn: "Just Name",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(42);
      expect(result.data.nameEn).toBe("Just Name");
      expect(result.data.nameAr).toBeUndefined();
      expect(result.data.image).toBeUndefined();
    }
  });

  it("rejects missing categoryId", () => {
    const result = updateCategorySchema.safeParse({ nameEn: "Test" });
    expect(result.success).toBe(false);
  });

  it("rejects zero categoryId", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: 0,
      nameEn: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative categoryId", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: -1,
      nameEn: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string categoryId to number", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: "15",
      nameEn: "Test",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(15);
    }
  });

  it("accepts update with only categoryId and nameAr", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: 10,
      nameAr: "الاسم العربي",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameAr).toBe("الاسم العربي");
      expect(result.data.nameEn).toBeUndefined();
    }
  });

  it("accepts update with only categoryId and image", () => {
    const result = updateCategorySchema.safeParse({
      categoryId: 10,
      image: "https://cdn.example.com/img.png",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBe("https://cdn.example.com/img.png");
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("categoryListItemSchema", () => {
  it("accepts a valid category list item", () => {
    const result = categoryListItemSchema.safeParse({
      category_id: 1,
      name_en: "Scholarships",
      name_ar: "المنح الدراسية",
      image: "https://cdn.example.com/img.png",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-02"),
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const result = categoryListItemSchema.safeParse({
      category_id: 2,
      name_en: "Discounts",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing category_id", () => {
    const result = categoryListItemSchema.safeParse({
      name_en: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name_en", () => {
    const result = categoryListItemSchema.safeParse({
      category_id: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for category_id", () => {
    const result = categoryListItemSchema.safeParse({
      category_id: "abc",
      name_en: "Test",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listCategoriesResultSchema", () => {
  it("accepts a valid list result", () => {
    const result = listCategoriesResultSchema.safeParse({
      categories: [
        {
          category_id: 1,
          name_en: "Scholarships",
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
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty categories array", () => {
    const result = listCategoriesResultSchema.safeParse({
      categories: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total field", () => {
    const result = listCategoriesResultSchema.safeParse({
      categories: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCategoriesResultSchema.safeParse({
      categories: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});
