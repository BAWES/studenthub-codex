"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  categoryListItemSchema,
  listCategoriesResultSchema,
  listCategoriesSchema,
  getCategorySchema,
  createCategorySchema,
  updateCategorySchema,
  type CategoryListItem,
  type ListCategoriesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCategories
// ---------------------------------------------------------------------------

/**
 * List discount categories with pagination.
 *
 * Mirrors the legacy Yii2 DiscountCategoryController::actionList.
 */
export async function listCategories(
  params: FormData | z.input<typeof listCategoriesSchema> = {},
): Promise<ListCategoriesResult> {
  await requireCapability("discount.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listCategoriesSchema.safeParse(raw);
  if (!parsed.success) {
    return { categories: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    prisma.discount_category.findMany({
      orderBy: { name_en: "asc" },
      skip,
      take: limit,
    }),
    prisma.discount_category.count(),
  ]);

  const result: ListCategoriesResult = {
    categories: categories.map((c: any): CategoryListItem => ({
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

  const outputParsed = listCategoriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/categories] listCategories output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCategory
// ---------------------------------------------------------------------------

/**
 * Get a single discount category by ID.
 * Returns null if not found.
 */
export async function getCategory(
  categoryId: number,
): Promise<CategoryListItem | null> {
  await requireCapability("discount.read");

  const parsed = getCategorySchema.safeParse({ categoryId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid category ID");
  }

  const category = await prisma.discount_category.findFirst({
    where: { category_id: parsed.data.categoryId },
  });

  if (!category) return null;

  const raw = category as any;
  const result: CategoryListItem = {
    category_id: raw.category_id,
    name_en: raw.name_en,
    name_ar: raw.name_ar ?? null,
    image: raw.image ?? null,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
  };

  const outputParsed = categoryListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/categories] getCategory output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createCategory
// ---------------------------------------------------------------------------

/**
 * Create a new discount category.
 *
 * Mirrors the legacy Yii2 DiscountCategoryController::actionCreate.
 */
export async function createCategory(
  data: z.input<typeof createCategorySchema>,
): Promise<{ category_id: number }> {
  await requireCapability("discount.write");

  const parsed = createCategorySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid category data");
  }

  const { nameEn, nameAr, image } = parsed.data;

  const category = await prisma.discount_category.create({
    data: {
      name_en: nameEn,
      name_ar: nameAr ?? null,
      image: image ?? null,
    } as any,
  });

  revalidatePath("/admin/discounts");
  revalidatePath("/staff/discounts");

  const result = { category_id: category.category_id };

  const outputParsed = z
    .object({ category_id: z.number() })
    .safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/categories] createCategory output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateCategory
// ---------------------------------------------------------------------------

/**
 * Update an existing discount category.
 * Only provided fields are updated — partial update semantics.
 */
export async function updateCategory(
  data: z.input<typeof updateCategorySchema>,
): Promise<{ category_id: number }> {
  await requireCapability("discount.write");

  const parsed = updateCategorySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid category data");
  }

  const { categoryId, ...fields } = parsed.data;

  const existing = await prisma.discount_category.findFirst({
    where: { category_id: categoryId },
    select: { category_id: true },
  });
  if (!existing) {
    throw new Error("Category not found");
  }

  const updateData: Record<string, unknown> = {};
  if (fields.nameEn !== undefined) updateData.name_en = fields.nameEn;
  if (fields.nameAr !== undefined) updateData.name_ar = fields.nameAr;
  if (fields.image !== undefined) updateData.image = fields.image;
  updateData.updated_at = new Date();

  await prisma.discount_category.update({
    where: { category_id: categoryId },
    data: updateData as any,
  });

  revalidatePath("/admin/discounts");
  revalidatePath("/staff/discounts");

  const result = { category_id: categoryId };

  const outputParsed = z
    .object({ category_id: z.number() })
    .safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/categories] updateCategory output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
