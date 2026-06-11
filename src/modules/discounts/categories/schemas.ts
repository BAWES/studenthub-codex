import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listDiscountCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().optional(),
});

export const getDiscountCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive("Category ID must be a positive integer"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListDiscountCategoriesParams = z.input<typeof listDiscountCategoriesSchema>;
export type GetDiscountCategoryParams = z.input<typeof getDiscountCategorySchema>;

export type DiscountCategoryItem = {
  category_id: number;
  name_en: string;
  name_ar: string | null;
  image: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListDiscountCategoriesResult = {
  categories: DiscountCategoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
