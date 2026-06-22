import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listDiscountCategoriesSchema,
  discountCategoryItemSchema,
  listDiscountCategoriesResultSchema,
} from "./schemas";
import type { DiscountCategoryItem, ListDiscountCategoriesResult } from "./schemas";

const { mockRequireCapability, mockFindMany, mockCount } = vi.hoisted(
  () => ({
    mockRequireCapability: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
  }),
);

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    discount_category: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

import { listDiscountCategories } from "./actions";

describe("listDiscountCategoriesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listDiscountCategoriesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listDiscountCategoriesSchema.safeParse({ page: 2, limit: 25 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects limit over 200", () => {
    const result = listDiscountCategoriesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDiscountCategoriesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listDiscountCategoriesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

describe("discountCategoryItemSchema", () => {
  it("accepts a valid category item", () => {
    const item: DiscountCategoryItem = {
      category_id: 1,
      name_en: "Military",
      name_ar: null,
      image: null,
      created_at: new Date("2026-01-01"),
      updated_at: null,
    };
    const result = discountCategoryItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const item: DiscountCategoryItem = {
      category_id: 2,
      name_en: "Corporate",
      name_ar: null,
      image: null,
      created_at: null,
      updated_at: null,
    };
    const result = discountCategoryItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing category_id", () => {
    const result = discountCategoryItemSchema.safeParse({
      name_en: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("listDiscountCategoriesResultSchema", () => {
  it("accepts a valid list result with items", () => {
    const result: ListDiscountCategoriesResult = {
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
    const parsed = listDiscountCategoriesResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty categories array", () => {
    const result: ListDiscountCategoriesResult = {
      categories: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listDiscountCategoriesResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-array categories", () => {
    const result = {
      categories: "not-an-array",
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listDiscountCategoriesResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

describe("listDiscountCategories action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        category_id: 1,
        name_en: "Military",
        name_ar: null,
        image: null,
        created_at: new Date("2026-01-01"),
        updated_at: null,
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listDiscountCategories({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name_en: "asc" },
        skip: 0,
        take: 50,
      }),
    );
    expect(result.categories).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listDiscountCategories({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("returns empty result when no categories exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listDiscountCategories({});

    expect(result.categories).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listDiscountCategories({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});
