"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive(),
});

const createCategorySchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().optional(),
  image: z.string().optional(),
});

const updateCategorySchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  nameEn: z.string().optional(),
  nameAr: z.string().optional(),
  image: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CategoryListItem = {
  category_id: number;
  name_en: string;
  name_ar: string | null;
  image: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListCategoriesResult = {
  categories: CategoryListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------

export {
  listCategoriesSchema,
  getCategorySchema,
  createCategorySchema,
  updateCategorySchema,
};

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

  return {
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
  return {
    category_id: raw.category_id,
    name_en: raw.name_en,
    name_ar: raw.name_ar ?? null,
    image: raw.image ?? null,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
  };
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
  return { category_id: category.category_id };
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
  return { category_id: categoryId };
}
