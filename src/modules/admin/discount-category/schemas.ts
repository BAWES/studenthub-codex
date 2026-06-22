import { z } from "zod";

export const listDiscountCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const createDiscountCategorySchema = z.object({
  name_en: z.string().min(1, "English name is required").max(255),
  name_ar: z.string().max(255).optional().nullable(),
  image: z.string().max(255).optional().nullable(),
});

export const updateDiscountCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive("Category ID is required"),
  name_en: z.string().min(1, "English name is required").max(255),
  name_ar: z.string().max(255).optional().nullable(),
  image: z.string().max(255).optional().nullable(),
});

export const deleteDiscountCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive("Category ID is required"),
});

export const discountCategoryItemSchema = z.object({
  category_id: z.number().int().positive(),
  name_en: z.string().min(1),
  name_ar: z.string().nullable(),
  image: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listDiscountCategoriesResultSchema = z.object({
  categories: z.array(discountCategoryItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const discountCategoryActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListDiscountCategoriesInput = z.input<typeof listDiscountCategoriesSchema>;
export type CreateDiscountCategoryInput = z.input<typeof createDiscountCategorySchema>;
export type UpdateDiscountCategoryInput = z.input<typeof updateDiscountCategorySchema>;
export type DeleteDiscountCategoryInput = z.input<typeof deleteDiscountCategorySchema>;

export type DiscountCategoryItem = z.output<typeof discountCategoryItemSchema>;
export type ListDiscountCategoriesResult = z.output<typeof listDiscountCategoriesResultSchema>;
export type DiscountCategoryActionResponse = z.output<typeof discountCategoryActionResponseSchema>;
