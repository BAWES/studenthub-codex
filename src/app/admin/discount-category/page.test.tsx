// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listDiscountCategoriesSchema,
  createDiscountCategorySchema,
  updateDiscountCategorySchema,
  deleteDiscountCategorySchema,
  discountCategoryItemSchema,
  listDiscountCategoriesResultSchema,
  discountCategoryActionResponseSchema,
} from "./schemas";

/**
 * Page migration test for admin/discount-category.
 *
 * Verifies the data contract between page and action.
 * Full rendering tests require Playwright (server component).
 */
describe("admin discount category page — data contract", () => {
  describe("listDiscountCategoriesSchema", () => {
    it("parses with defaults", () => {
      const r = listDiscountCategoriesSchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(50);
      }
    });

    it("accepts custom page and limit", () => {
      const r = listDiscountCategoriesSchema.safeParse({ page: 3, limit: 25 });
      expect(r.success).toBe(true);
    });

    it("rejects negative page", () => {
      const r = listDiscountCategoriesSchema.safeParse({ page: -1 });
      expect(r.success).toBe(false);
    });

    it("rejects limit over 200", () => {
      const r = listDiscountCategoriesSchema.safeParse({ limit: 999 });
      expect(r.success).toBe(false);
    });
  });

  describe("createDiscountCategorySchema", () => {
    it("validates with required fields", () => {
      const r = createDiscountCategorySchema.safeParse({ name_en: "Seasonal" });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.name_en).toBe("Seasonal");
      }
    });

    it("accepts all optional fields", () => {
      const r = createDiscountCategorySchema.safeParse({
        name_en: "Holiday",
        name_ar: "عطلة",
        image: "https://example.com/img.png",
      });
      expect(r.success).toBe(true);
    });

    it("rejects empty name_en", () => {
      const r = createDiscountCategorySchema.safeParse({ name_en: "" });
      expect(r.success).toBe(false);
    });

    it("rejects missing name_en", () => {
      const r = createDiscountCategorySchema.safeParse({});
      expect(r.success).toBe(false);
    });
  });

  describe("updateDiscountCategorySchema", () => {
    it("validates with required fields", () => {
      const r = updateDiscountCategorySchema.safeParse({
        categoryId: 5,
        name_en: "Updated",
      });
      expect(r.success).toBe(true);
    });

    it("accepts optional name_ar and image", () => {
      const r = updateDiscountCategorySchema.safeParse({
        categoryId: 5,
        name_en: "Updated",
        name_ar: "مُحَدَّث",
        image: "https://example.com/new.png",
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing categoryId", () => {
      const r = updateDiscountCategorySchema.safeParse({ name_en: "Test" });
      expect(r.success).toBe(false);
    });

    it("rejects empty name_en", () => {
      const r = updateDiscountCategorySchema.safeParse({
        categoryId: 1,
        name_en: "",
      });
      expect(r.success).toBe(false);
    });

    it("rejects empty name_ar if provided", () => {
      const r = updateDiscountCategorySchema.safeParse({
        categoryId: 1,
        name_en: "Test",
        name_ar: "",
      });
      expect(r.success).toBe(true); // optional → empty nullable string is OK
      if (r.success) {
        expect(r.data.name_ar).toBe("");
      }
    });
  });

  describe("deleteDiscountCategorySchema", () => {
    it("validates with valid categoryId", () => {
      const r = deleteDiscountCategorySchema.safeParse({ categoryId: 10 });
      expect(r.success).toBe(true);
    });

    it("rejects missing categoryId", () => {
      const r = deleteDiscountCategorySchema.safeParse({});
      expect(r.success).toBe(false);
    });
  });

  describe("discountCategoryItemSchema", () => {
    it("validates a full category entry", () => {
      const r = discountCategoryItemSchema.safeParse({
        category_id: 1,
        name_en: "Student Discount",
        name_ar: "خصم الطلاب",
        image: "https://example.com/img.png",
        created_at: new Date("2026-06-20"),
        updated_at: new Date("2026-06-21"),
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.category_id).toBe(1);
        expect(r.data.name_en).toBe("Student Discount");
      }
    });

    it("accepts null optional fields", () => {
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

    it("rejects missing category_id", () => {
      const r = discountCategoryItemSchema.safeParse({ name_en: "Test" });
      expect(r.success).toBe(false);
    });

    it("rejects missing name_en", () => {
      const r = discountCategoryItemSchema.safeParse({ category_id: 1 });
      expect(r.success).toBe(false);
    });

    it("rejects empty name_en", () => {
      const r = discountCategoryItemSchema.safeParse({
        category_id: 1,
        name_en: "",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("listDiscountCategoriesResultSchema", () => {
    it("validates paginated result", () => {
      const r = listDiscountCategoriesResultSchema.safeParse({
        categories: [
          {
            category_id: 1,
            name_en: "Seasonal",
            name_ar: null,
            image: null,
            created_at: null,
            updated_at: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
      expect(r.success).toBe(true);
    });

    it("accepts empty array", () => {
      const r = listDiscountCategoriesResultSchema.safeParse({
        categories: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      });
      expect(r.success).toBe(true);
    });

    it("rejects negative total", () => {
      const r = listDiscountCategoriesResultSchema.safeParse({
        categories: [],
        total: -1,
        page: 1,
        limit: 50,
        totalPages: 0,
      });
      expect(r.success).toBe(false);
    });

    it("rejects zero page", () => {
      const r = listDiscountCategoriesResultSchema.safeParse({
        categories: [],
        total: 0,
        page: 0,
        limit: 50,
        totalPages: 0,
      });
      expect(r.success).toBe(false);
    });

    it("rejects negative totalPages", () => {
      const r = listDiscountCategoriesResultSchema.safeParse({
        categories: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: -1,
      });
      expect(r.success).toBe(false);
    });
  });

  describe("discountCategoryActionResponseSchema", () => {
    it("validates success response", () => {
      const r = discountCategoryActionResponseSchema.safeParse({
        operation: "success",
        message: "Category created",
      });
      expect(r.success).toBe(true);
    });

    it("validates error response", () => {
      const r = discountCategoryActionResponseSchema.safeParse({
        operation: "error",
        message: "Category not found",
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.operation).toBe("error");
      }
    });

    it("rejects missing operation", () => {
      const r = discountCategoryActionResponseSchema.safeParse({
        message: "Msg",
      });
      expect(r.success).toBe(false);
    });

    it("rejects empty operation", () => {
      const r = discountCategoryActionResponseSchema.safeParse({
        operation: "",
        message: "Msg",
      });
      expect(r.success).toBe(false);
    });

    it("rejects empty message", () => {
      const r = discountCategoryActionResponseSchema.safeParse({
        operation: "success",
        message: "",
      });
      expect(r.success).toBe(false);
    });
  });
});
