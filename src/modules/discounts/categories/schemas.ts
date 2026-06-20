import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const discountCategoryItemSchema = z.object({
  category_id: z.number(),
  name_en: z.string(),
  name_ar: z.string().nullable(),
  image: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listDiscountCategoriesResultSchema = z.object({
  categories: z.array(discountCategoryItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type DiscountCategoryItem = z.output<typeof discountCategoryItemSchema>;
export type ListDiscountCategoriesResult = z.output<typeof listDiscountCategoriesResultSchema>;
