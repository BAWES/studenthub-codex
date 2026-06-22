import { z } from "zod";

export const getDiscountCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive("Category ID is required"),
});

export const discountCategoryDetailItemSchema = z.object({
  category_id: z.number().int().positive(),
  name_en: z.string().min(1),
  name_ar: z.string().nullable(),
  image: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const getDiscountCategoryResultSchema = z.object({
  category: discountCategoryDetailItemSchema.nullable(),
});

export type DiscountCategoryDetailItem = z.output<typeof discountCategoryDetailItemSchema>;
export type GetDiscountCategoryResult = z.output<typeof getDiscountCategoryResultSchema>;
export type GetDiscountCategoryInput = z.input<typeof getDiscountCategorySchema>;
