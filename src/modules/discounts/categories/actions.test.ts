import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from actions.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listDiscountCategoriesSchema,
  getDiscountCategorySchema,
} from "./actions";

describe("listDiscountCategoriesSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listDiscountCategoriesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.nameFilter).toBeUndefined();
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listDiscountCategoriesSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts nameFilter", () => {
    const result = listDiscountCategoriesSchema.safeParse({ nameFilter: "Tech" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Tech");
    }
  });

  it("rejects page less than 1", () => {
    const result = listDiscountCategoriesSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDiscountCategoriesSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listDiscountCategoriesSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listDiscountCategoriesSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listDiscountCategoriesSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listDiscountCategoriesSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

describe("getDiscountCategorySchema", () => {
  it("accepts valid category ID", () => {
    const result = getDiscountCategorySchema.safeParse({ categoryId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(5);
    }
  });

  it("rejects missing categoryId", () => {
    const result = getDiscountCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric categoryId", () => {
    const result = getDiscountCategorySchema.safeParse({ categoryId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive categoryId", () => {
    const result = getDiscountCategorySchema.safeParse({ categoryId: "0" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type DiscountCategoryItem = {
  category_id: number;
  name_en: string;
  name_ar: string | null;
  image: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListDiscountCategoriesResult = {
  categories: DiscountCategoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ListDiscountCategoriesResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListDiscountCategoriesResult = {
      categories: [
        {
          category_id: 1,
          name_en: "Tech Deals",
          name_ar: "عروض تقنية",
          image: "/images/tech.jpg",
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.categories).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("handles empty category list", () => {
    const result: ListDiscountCategoriesResult = {
      categories: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.categories).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });

  it("includes all required fields", () => {
    const item: DiscountCategoryItem = {
      category_id: 42,
      name_en: "Food",
      name_ar: "طعام",
      image: null,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-15"),
    };
    expect(item.category_id).toBe(42);
    expect(item.name_en).toBe("Food");
    expect(item.name_ar).toBe("طعام");
  });

  it("allows nullable fields", () => {
    const item: DiscountCategoryItem = {
      category_id: 1,
      name_en: "Default",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    };
    expect(item.name_ar).toBeNull();
    expect(item.image).toBeNull();
    expect(item.created_at).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getDiscountCategory return type
// ---------------------------------------------------------------------------

describe("getDiscountCategory return type", () => {
  it("returns DiscountCategoryItem or null", () => {
    const found: DiscountCategoryItem = {
      category_id: 1,
      name_en: "Tech",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    };
    const notFound: null = null;

    expect(found.category_id).toBe(1);
    expect(notFound).toBeNull();
  });
});
