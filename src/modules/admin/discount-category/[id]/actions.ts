"use server";

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
        "[admin/discount-category/[id]] getDiscountCategory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  const result = {
    category: {
      ...row,
      name_ar: row.name_ar ?? null,
      image: row.image ?? null,
    },
  };

  const outputParsed = getDiscountCategoryResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/discount-category/[id]] getDiscountCategory output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
