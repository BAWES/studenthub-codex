import { describe, it, expect } from "vitest";
import {
  discountCategoryItemSchema,
  listDiscountCategoriesResultSchema,
  discountCategoryIdResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: discount-category schema validation
// ---------------------------------------------------------------------------

const validDiscountCategoryListItem = {
  category_id: 1,
  name_en: "Student Discount",
  name_ar: "خصم طلاب",
  image: "/images/discount.png",
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-15"),
};

describe("discountCategoryItemSchema", () => {
  it("accepts a valid discount category list item", () => {
    const result = discountCategoryItemSchema.safeParse(validDiscountCategoryListItem);
    expect(result.success).toBe(true);
  });

  it("accepts null optional fields", () => {
    const result = discountCategoryItemSchema.safeParse({
      category_id: 1,
      name_en: "Student Discount",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required category_id", () => {
    const { category_id, ...incomplete } = validDiscountCategoryListItem;
    const result = discountCategoryItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects missing required name_en", () => {
    const { name_en, ...incomplete } = validDiscountCategoryListItem;
    const result = discountCategoryItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects non-number category_id", () => {
    const result = discountCategoryItemSchema.safeParse({
      ...validDiscountCategoryListItem,
      category_id: "not-a-number",
    });
    expect(result.success).toBe(false);
  });
});

describe("listDiscountCategoriesResultSchema", () => {
  it("accepts a valid result with records array", () => {
    const result = listDiscountCategoriesResultSchema.safeParse({
      records: [validDiscountCategoryListItem],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty records array", () => {
    const result = listDiscountCategoriesResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total field", () => {
    const { total, ...incomplete } = {
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const result = listDiscountCategoriesResultSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

describe("discountCategoryItemSchema (detail)", () => {
  it("accepts a valid detail object", () => {
    const result = discountCategoryItemSchema.safeParse(validDiscountCategoryListItem);
    expect(result.success).toBe(true);
  });
});

describe("discountCategoryIdResultSchema", () => {
  it("accepts a valid result with category_id", () => {
    const result = discountCategoryIdResultSchema.safeParse({
      category_id: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing category_id", () => {
    const result = discountCategoryIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-number category_id", () => {
    const result = discountCategoryIdResultSchema.safeParse({ category_id: "abc" });
    expect(result.success).toBe(false);
  });
});
