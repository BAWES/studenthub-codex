import { describe, it, expect } from "vitest";
import {
  discountCategoryItemSchema,
  listDiscountCategoriesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// discountCategoryItemSchema
// ---------------------------------------------------------------------------

describe("discountCategoryItemSchema", () => {
  const validItem = () => ({
    category_id: 1,
    name_en: "Electronics",
    name_ar: "إلكترونيات",
    image: "/uploads/electronics.png",
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  });

  it("accepts a valid category item", () => {
    const r = discountCategoryItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = discountCategoryItemSchema.safeParse({
      ...validItem(),
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing category_id", () => {
    const { category_id: _, ...rest } = validItem();
    expect(discountCategoryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string name_en", () => {
    expect(
      discountCategoryItemSchema.safeParse({ ...validItem(), name_en: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDiscountCategoriesResultSchema
// ---------------------------------------------------------------------------

describe("listDiscountCategoriesResultSchema", () => {
  const validItem = () => ({
    category_id: 1,
    name_en: "Cat",
    name_ar: null,
    image: null,
    created_at: null,
    updated_at: null,
  });

  it("accepts a valid paginated result", () => {
    const r = listDiscountCategoriesResultSchema.safeParse({
      categories: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty categories array", () => {
    const r = listDiscountCategoriesResultSchema.safeParse({
      categories: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    const r = listDiscountCategoriesResultSchema.safeParse({
      categories: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});
