import { describe, it, expect } from "vitest";
import { discountCategoryItemSchema, listDiscountCategoriesResultSchema, discountCategoryActionResponseSchema } from "./schemas";

describe("discountCategoryItemSchema", () => {
  const validItem = {
    category_id: 1,
    name_en: "Military",
    name_ar: null,
    image: null,
    created_at: new Date("2026-01-01"),
    updated_at: null,
  };

  it("accepts a valid discount category item", () => {
    expect(discountCategoryItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts all nullable fields", () => {
    expect(
      discountCategoryItemSchema.safeParse({
        ...validItem,
        name_ar: null,
        image: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("accepts Arabic name and image URL", () => {
    expect(
      discountCategoryItemSchema.safeParse({
        ...validItem,
        name_ar: "عسكري",
        image: "https://example.com/img.png",
      }).success,
    ).toBe(true);
  });

  it("rejects missing category_id", () => {
    const { category_id: _, ...rest } = validItem;
    expect(discountCategoryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty name_en", () => {
    expect(
      discountCategoryItemSchema.safeParse({ ...validItem, name_en: "" }).success,
    ).toBe(false);
  });

  it("rejects negative category_id", () => {
    expect(
      discountCategoryItemSchema.safeParse({ ...validItem, category_id: -1 }).success,
    ).toBe(false);
  });
});

describe("listDiscountCategoriesResultSchema", () => {
  const validResult = {
    categories: [
      {
        category_id: 1,
        name_en: "Military",
        name_ar: null,
        image: null,
        created_at: new Date("2026-01-01"),
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listDiscountCategoriesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty categories array", () => {
    expect(
      listDiscountCategoriesResultSchema.safeParse({
        ...validResult,
        categories: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing categories", () => {
    const { categories: _, ...rest } = validResult;
    expect(listDiscountCategoriesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listDiscountCategoriesResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });
});

describe("discountCategoryActionResponseSchema", () => {
  it("accepts a valid action response", () => {
    expect(
      discountCategoryActionResponseSchema.safeParse({
        operation: "created",
        message: "Category created",
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      discountCategoryActionResponseSchema.safeParse({ message: "Done" }).success,
    ).toBe(false);
  });
});
