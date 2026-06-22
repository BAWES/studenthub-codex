import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDiscountCategorySchema, getDiscountCategoryResultSchema } from "./schemas";

const { mockRequireCapability, mockFindUnique } = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    discount_category: {
      findUnique: mockFindUnique,
    },
  },
}));

import { getDiscountCategory } from "./actions";

describe("getDiscountCategorySchema", () => {
  it("accepts a valid category ID", () => {
    const result = getDiscountCategorySchema.safeParse({ categoryId: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(5);
    }
  });

  it("rejects zero category ID", () => {
    const result = getDiscountCategorySchema.safeParse({ categoryId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects missing categoryId", () => {
    const result = getDiscountCategorySchema.safeParse({});
    expect(result.success).toBe(false);
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

describe("getDiscountCategory action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a category by ID", async () => {
    const dbRow = {
      category_id: 5,
      name_en: "Military",
      name_ar: null,
      image: null,
      created_at: new Date("2026-01-01"),
      updated_at: null,
    };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(dbRow);

    const result = await getDiscountCategory({ categoryId: 5 });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { category_id: 5 },
    });
    expect(result.category).not.toBeNull();
    expect(result.category?.category_id).toBe(5);
    expect(result.category?.name_en).toBe("Military");
  });

  it("returns null when category not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getDiscountCategory({ categoryId: 999 });

    expect(result.category).toBeNull();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      getDiscountCategory({ categoryId: 5 }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
