import { z } from "zod";

// ---------------------------------------------------------------------------
// Discount Category Detail schemas — single-category detail page
// ---------------------------------------------------------------------------

/**
 * Input schema for getDiscountCategory.
 */
export const getDiscountCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive("Category ID is required"),
});

/**
 * Schema for a single discount category item in detail response.
 */
export const discountCategoryItemSchema = z.object({
  category_id: z.number().int().positive(),
  name_en: z.string().min(1),
  name_ar: z.string().nullable(),
  image: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * Output schema for getDiscountCategory.
 */
export const getDiscountCategoryResultSchema = z.object({
  category: discountCategoryItemSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type DiscountCategoryItem = z.output<typeof discountCategoryItemSchema>;
export type GetDiscountCategoryResult = z.output<typeof getDiscountCategoryResultSchema>;
export type GetDiscountCategoryInput = z.input<typeof getDiscountCategorySchema>;
