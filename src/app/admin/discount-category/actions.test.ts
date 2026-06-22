import { describe, it, expect } from "vitest";
import {
  listDiscountCategoriesSchema,
  createDiscountCategorySchema,
  updateDiscountCategorySchema,
  deleteDiscountCategorySchema,
  discountCategoryItemSchema,
  listDiscountCategoriesResultSchema,
  discountCategoryActionResponseSchema,
} from "./schemas";
import type { DiscountCategoryItem, ListDiscountCategoriesResult } from "./schemas";

describe("listDiscountCategoriesSchema", () => {
  it("accepts empty params", () => { const r = listDiscountCategoriesSchema.safeParse({}); expect(r.success).toBe(true); if (r.success) { expect(r.data.page).toBe(1); expect(r.data.limit).toBe(50); } });
  it("accepts full filter", () => { const r = listDiscountCategoriesSchema.safeParse({ page: 2, limit: 25 }); expect(r.success).toBe(true); });
  it("rejects limit over 200", () => expect(listDiscountCategoriesSchema.safeParse({ limit: 999 }).success).toBe(false));
  it("rejects negative page", () => expect(listDiscountCategoriesSchema.safeParse({ page: -1 }).success).toBe(false));
});

describe("createDiscountCategorySchema", () => {
  it("accepts valid input", () => { const r = createDiscountCategorySchema.safeParse({ name_en: "Seasonal" }); expect(r.success).toBe(true); if (r.success) expect(r.data.name_en).toBe("Seasonal"); });
  it("accepts input with all fields", () => { const r = createDiscountCategorySchema.safeParse({ name_en: "Holiday", name_ar: "عطلة", image: "https://example.com/img.png" }); expect(r.success).toBe(true); });
  it("rejects empty name", () => expect(createDiscountCategorySchema.safeParse({ name_en: "" }).success).toBe(false));
  it("rejects missing name", () => expect(createDiscountCategorySchema.safeParse({}).success).toBe(false));
});

describe("updateDiscountCategorySchema", () => {
  it("accepts valid update", () => expect(updateDiscountCategorySchema.safeParse({ categoryId: 1, name_en: "Updated" }).success).toBe(true));
  it("rejects missing id", () => expect(updateDiscountCategorySchema.safeParse({ name_en: "Updated" }).success).toBe(false));
  it("rejects empty name", () => expect(updateDiscountCategorySchema.safeParse({ category_id: 1, name_en: "" }).success).toBe(false));
});

describe("deleteDiscountCategorySchema", () => {
  it("accepts valid id", () => expect(deleteDiscountCategorySchema.safeParse({ categoryId: 1 }).success).toBe(true));
  it("rejects missing id", () => expect(deleteDiscountCategorySchema.safeParse({}).success).toBe(false));
});

describe("DiscountCategoryItem type", () => {
  it("has required shape", () => {
    const i: DiscountCategoryItem = { category_id: 1, name_en: "Seasonal", name_ar: null, image: null, created_at: new Date(), updated_at: null };
    expect(i.category_id).toBe(1);
  });
  it("accepts null optional fields", () => {
    const i: DiscountCategoryItem = { category_id: 2, name_en: "Holiday", name_ar: null, image: null, created_at: null, updated_at: null };
    expect(i.name_ar).toBeNull();
  });
});

describe("ListDiscountCategoriesResult", () => {
  it("has correct shape", () => {
    const r: ListDiscountCategoriesResult = { categories: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    expect(r.categories).toHaveLength(0);
    expect(r.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Output validation — discountCategoryItemSchema
// ---------------------------------------------------------------------------

describe("discountCategoryItemSchema (output validation)", () => {
  it("accepts a valid item", () => {
    const r = discountCategoryItemSchema.safeParse({
      category_id: 1,
      name_en: "Seasonal",
      name_ar: null,
      image: "https://example.com/img.png",
      created_at: new Date("2026-01-01"),
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts item with all nulls", () => {
    const r = discountCategoryItemSchema.safeParse({
      category_id: 2,
      name_en: "Holiday",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(discountCategoryItemSchema.safeParse({ name_en: "Seasonal" }).success).toBe(false);
  });

  it("rejects empty name_en", () => {
    expect(discountCategoryItemSchema.safeParse({ category_id: 1, name_en: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — listDiscountCategoriesResultSchema
// ---------------------------------------------------------------------------

describe("listDiscountCategoriesResultSchema (output validation)", () => {
  const validResponse = {
    categories: [{ category_id: 1, name_en: "Seasonal", name_ar: null, image: null, created_at: new Date(), updated_at: null }],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid response", () => {
    const r = listDiscountCategoriesResultSchema.safeParse(validResponse);
    expect(r.success).toBe(true);
  });

  it("accepts empty array", () => {
    const r = listDiscountCategoriesResultSchema.safeParse({
      ...validResponse,
      categories: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    expect(listDiscountCategoriesResultSchema.safeParse({ categories: [], page: 1, limit: 50, totalPages: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listDiscountCategoriesResultSchema.safeParse({ ...validResponse, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — discountCategoryActionResponseSchema
// ---------------------------------------------------------------------------

describe("discountCategoryActionResponseSchema (output validation)", () => {
  it("accepts success response", () => {
    const r = discountCategoryActionResponseSchema.safeParse({ operation: "success", message: "Category created" });
    expect(r.success).toBe(true);
  });
  it("accepts error response", () => {
    const r = discountCategoryActionResponseSchema.safeParse({ operation: "error", message: "Not found" });
    expect(r.success).toBe(true);
  });
  it("rejects missing operation", () => expect(discountCategoryActionResponseSchema.safeParse({ message: "Msg" }).success).toBe(false));
  it("rejects empty operation", () => expect(discountCategoryActionResponseSchema.safeParse({ operation: "", message: "Msg" }).success).toBe(false));
  it("rejects empty message", () => expect(discountCategoryActionResponseSchema.safeParse({ operation: "success", message: "" }).success).toBe(false));
});
