"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listDiscountCategoriesSchema,
  createDiscountCategorySchema,
  updateDiscountCategorySchema,
  deleteDiscountCategorySchema,
  listDiscountCategoriesResultSchema,
  discountCategoryActionResponseSchema,
} from "./schemas";
import type {
  ListDiscountCategoriesInput,
  ListDiscountCategoriesResult,
  DiscountCategoryActionResponse,
} from "./schemas";

export async function listDiscountCategories(
  input: ListDiscountCategoriesInput = {},
): Promise<ListDiscountCategoriesResult> {
  await requireCapability("admin.read");
  const parsed = listDiscountCategoriesSchema.safeParse(input);
  if (!parsed.success)
    return { categories: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.discount_category.findMany({
      orderBy: { name_en: "asc" },
      skip,
      take: limit,
      select: {
        category_id: true,
        name_en: true,
        name_ar: true,
        image: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.discount_category.count(),
  ]);
  const categories = rows.map((row) => ({
    category_id: row.category_id,
    name_en: row.name_en,
    name_ar: row.name_ar,
    image: row.image,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
  const result = {
    categories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDiscountCategoriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/discount-category] listDiscountCategories output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function createDiscountCategory(
  name_en: string,
  name_ar?: string | null,
  image?: string | null,
): Promise<DiscountCategoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = createDiscountCategorySchema.safeParse({
    name_en,
    name_ar: name_ar ?? null,
    image: image ?? null,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  try {
    await prisma.discount_category.create({
      data: {
        name_en: parsed.data.name_en,
        name_ar: parsed.data.name_ar ?? null,
        image: parsed.data.image ?? null,
      },
    });
    revalidatePath("/admin/discount-category");
    const result = {
      operation: "success",
      message: "Discount category created successfully",
    };
    const outputParsed = discountCategoryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/discount-category] createDiscountCategory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem creating the discount category, please contact us for assistance.",
    };
    const outputParsed = discountCategoryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/discount-category] createDiscountCategory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function updateDiscountCategory(
  categoryId: number,
  name_en: string,
  name_ar?: string | null,
  image?: string | null,
): Promise<DiscountCategoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateDiscountCategorySchema.safeParse({
    categoryId,
    name_en,
    name_ar: name_ar ?? null,
    image: image ?? null,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  try {
    const existing = await prisma.discount_category.findUnique({
      where: { category_id: parsed.data.categoryId },
      select: { category_id: true },
    });
    if (!existing)
      return { operation: "error", message: "Discount category not found" };
    await prisma.discount_category.update({
      where: { category_id: parsed.data.categoryId },
      data: {
        name_en: parsed.data.name_en,
        name_ar: parsed.data.name_ar ?? null,
        image: parsed.data.image ?? null,
      },
    });
    revalidatePath("/admin/discount-category");
    const result = {
      operation: "success",
      message: "Discount category successfully updated",
    };
    const outputParsed = discountCategoryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/discount-category] updateDiscountCategory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem updating the discount category, please contact us for assistance.",
    };
    const outputParsed = discountCategoryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/discount-category] updateDiscountCategory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function deleteDiscountCategory(
  categoryId: number,
): Promise<DiscountCategoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteDiscountCategorySchema.safeParse({ categoryId });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid category ID",
    };
  try {
    const existing = await prisma.discount_category.findUnique({
      where: { category_id: parsed.data.categoryId },
      select: { category_id: true },
    });
    if (!existing)
      return { operation: "error", message: "Discount category not found" };
    await prisma.discount_category.delete({
      where: { category_id: parsed.data.categoryId },
    });
    revalidatePath("/admin/discount-category");
    const result = {
      operation: "success",
      message: "Discount category deleted successfully",
    };
    const outputParsed = discountCategoryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/discount-category] deleteDiscountCategory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem deleting the discount category, please contact us for assistance.",
    };
    const outputParsed = discountCategoryActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/discount-category] deleteDiscountCategory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}
