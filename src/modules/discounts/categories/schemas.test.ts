import { describe, it, expect } from "vitest";
import {
  discountCategoryItemSchema,
  listDiscountCategoriesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// discountCategoryItemSchema
// ---------------------------------------------------------------------------
describe("discountCategoryItemSchema", () => {
  const valid = {
    category_id: 1,
    name_en: "Holiday",
    name_ar: null,
    image: null,
    created_at: new Date("2026-01-01"),
    updated_at: null,
  };

  it("accepts valid item", () => {
    expect(discountCategoryItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts with Arabic name and image", () => {
    const r = discountCategoryItemSchema.safeParse({
      ...valid,
      name_ar: "عطلة",
      image: "/images/holiday.png",
      updated_at: new Date("2026-01-15"),
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing category_id", () => {
    const { category_id: _, ...rest } = valid;
    expect(discountCategoryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name_en", () => {
    const { name_en: _, ...rest } = valid;
    expect(discountCategoryItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDiscountCategoriesResultSchema
// ---------------------------------------------------------------------------
describe("listDiscountCategoriesResultSchema", () => {
  const valid = {
    categories: [
      {
        category_id: 1,
        name_en: "Holiday",
        name_ar: null,
        image: null,
        created_at: new Date("2026-01-01"),
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid response", () => {
    expect(listDiscountCategoriesResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty categories", () => {
    const r = listDiscountCategoriesResultSchema.safeParse({
      ...valid,
      categories: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listDiscountCategoriesResultSchema.safeParse(rest).success).toBe(false);
  });
});