import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const categoryListItemSchema = z.object({
  category_id: z.number(),
  name_en: z.string(),
  name_ar: z.string().nullable(),
  image: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type CategoryListItem = z.output<typeof categoryListItemSchema>;

export const listCategoriesResultSchema = z.object({
  categories: z.array(categoryListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListCategoriesResult = z.output<typeof listCategoriesResultSchema>;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive(),
});

export const createCategorySchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().optional(),
  image: z.string().optional(),
});

export const updateCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  nameEn: z.string().optional(),
  nameAr: z.string().optional(),
  image: z.string().optional(),
});
