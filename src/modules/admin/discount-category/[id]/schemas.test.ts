import { describe, it, expect } from "vitest";
import { getDiscountCategorySchema, getDiscountCategoryResultSchema, discountCategoryDetailItemSchema } from "./schemas";

describe("getDiscountCategorySchema", () => {
  it("accepts a valid category ID", () => {
    const result = getDiscountCategorySchema.safeParse({ categoryId: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(5);
    }
  });

  it("coerces string ID to number", () => {
    const result = getDiscountCategorySchema.safeParse({ categoryId: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(3);
    }
  });

  it("rejects missing categoryId", () => {
    const result = getDiscountCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero categoryId", () => {
    const result = getDiscountCategorySchema.safeParse({ categoryId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("discountCategoryDetailItemSchema", () => {
  const validItem = {
    category_id: 1,
    name_en: "Military",
    name_ar: null,
    image: null,
    created_at: new Date("2026-01-01"),
    updated_at: null,
  };

  it("accepts a valid detail item", () => {
    expect(discountCategoryDetailItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("rejects missing category_id", () => {
    const { category_id: _, ...rest } = validItem;
    expect(discountCategoryDetailItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("getDiscountCategoryResultSchema", () => {
  it("accepts a valid category result", () => {
    const result = getDiscountCategoryResultSchema.safeParse({
      category: {
        category_id: 1,
        name_en: "Military",
        name_ar: null,
        image: null,
        created_at: new Date("2026-01-01"),
        updated_at: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts null category (not found)", () => {
    const result = getDiscountCategoryResultSchema.safeParse({ category: null });
    expect(result.success).toBe(true);
  });
});
