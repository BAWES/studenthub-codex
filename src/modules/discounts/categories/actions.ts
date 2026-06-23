"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  discountCategoryItemSchema,
  listDiscountCategoriesResultSchema,
  type DiscountCategoryItem,
  type ListDiscountCategoriesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas (input)
// ---------------------------------------------------------------------------

const listDiscountCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().optional(),
});

const getDiscountCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive("Category ID must be a positive integer"),
});

// ---------------------------------------------------------------------------
// Types (input)
// ---------------------------------------------------------------------------

export type ListDiscountCategoriesParams = z.input<typeof listDiscountCategoriesSchema>;
export type GetDiscountCategoryParams = z.input<typeof getDiscountCategorySchema>;

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------

export { listDiscountCategoriesSchema, getDiscountCategorySchema };

// ---------------------------------------------------------------------------
// listDiscountCategories
// ---------------------------------------------------------------------------

/**
 * List discount categories with pagination and optional name filter.
 *
 * Mirrors the legacy DiscountCategoryController::actionList.
 * - Filters by name (case-insensitive) when nameFilter is provided
 * - Paginated with configurable page/limit
 * - Sorted by newest first
 */
export async function listDiscountCategories(
  params: ListDiscountCategoriesParams = {},
): Promise<ListDiscountCategoriesResult> {
  await requireCapability("admin.read");

  const parsed = listDiscountCategoriesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { page, limit, nameFilter } = parsed.data;

  const where: Record<string, unknown> = {};
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { name_en: { contains: nameFilter, mode: "insensitive" } },
      { name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.discount_category.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.discount_category.count({ where: where as any }),
  ]);

  const result: ListDiscountCategoriesResult = {
    categories: categories.map((c) => ({
      category_id: c.category_id,
      name_en: c.name_en,
      name_ar: c.name_ar ?? null,
      image: c.image ?? null,
      created_at: c.created_at ?? null,
      updated_at: c.updated_at ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDiscountCategoriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/discounts/categories] listDiscountCategories output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getDiscountCategory
// ---------------------------------------------------------------------------

/**
 * Get a single discount category by ID.
 * Returns null if not found.
 */
export async function getDiscountCategory(
  params: GetDiscountCategoryParams,
): Promise<DiscountCategoryItem | null> {
  await requireCapability("admin.read");

  const parsed = getDiscountCategorySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid discount category ID",
    );
  }

  const { categoryId } = parsed.data;

  const category = await prisma.discount_category.findUnique({
    where: { category_id: categoryId },
  });

  if (!category) return null;

  const result: DiscountCategoryItem = {
    category_id: category.category_id,
    name_en: category.name_en,
    name_ar: category.name_ar ?? null,
    image: category.image ?? null,
    created_at: category.created_at ?? null,
    updated_at: category.updated_at ?? null,
  };

  const outputParsed = discountCategoryItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/discounts/categories] getDiscountCategory output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
