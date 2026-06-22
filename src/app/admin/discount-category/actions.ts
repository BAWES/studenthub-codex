"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getDiscountCategoryDetail(id: number) {
  await requireRoleCapability("admin", "admin.system");
  return prisma.discount_category.findUnique({
    where: { category_id: id },
    select: {
      category_id: true,
      name_en: true,
      name_ar: true,
      image: true,
      created_at: true,
      updated_at: true,
    }
  });
}

export async function updateDiscountCategory(
  id: number,
  data: {
    name_en: string;
    name_ar?: string;
    image?: string | null;
  }
) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.discount_category.update({
    where: { category_id: id },
    data: {
      name_en: data.name_en,
      name_ar: data.name_ar ?? null,
      image: data.image ?? null,
      updated_at: new Date(),
    }
  });
  revalidatePath("/admin/discount-category");
}

export async function createDiscountCategory(data: {
  name_en: string;
  name_ar?: string;
  image?: string | null;
}) {
  await requireRoleCapability("admin", "admin.system");
  const result = await prisma.discount_category.create({
    data: {
      name_en: data.name_en,
      name_ar: data.name_ar ?? null,
      image: data.image ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    }
  });
  revalidatePath("/admin/discount-category");
  return { id: result.category_id };
}

export async function deleteDiscountCategory(id: number) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.discount_category.delete({
    where: { category_id: id }
  });
  revalidatePath("/admin/discount-category");
}
