"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getDiscountCategorySchema, getDiscountCategoryResultSchema } from "./schemas";
import type { GetDiscountCategoryResult, GetDiscountCategoryInput } from "./schemas";

export async function getDiscountCategory(
  input: GetDiscountCategoryInput,
): Promise<GetDiscountCategoryResult> {
  await requireCapability("admin.read");
  const parsed = getDiscountCategorySchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid category ID");
  const row = await prisma.discount_category.findUnique({
    where: { category_id: parsed.data.categoryId },
  });
  if (!row) {
    const result = { category: null };
    const outputParsed = getDiscountCategoryResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/discount-category/[categoryId]] getDiscountCategory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
  const result = {
    category: {
      category_id: row.category_id,
      name_en: row.name_en,
      name_ar: row.name_ar,
      image: row.image,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  };
  const outputParsed = getDiscountCategoryResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/discount-category/[categoryId]] getDiscountCategory output failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}
