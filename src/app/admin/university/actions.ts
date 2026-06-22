"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getUniversityDetail(id: number) {
  await requireRoleCapability("admin", "admin.system");
  return prisma.university.findUnique({
    where: { university_id: id },
    select: {
      university_id: true,
      university_name_en: true,
      university_name_ar: true,
      university_data_source: true,
      deleted: true,
      university_created_at: true,
      university_updated_at: true,
    }
  });
}

export async function updateUniversity(
  id: number,
  data: {
    university_name_en: string;
    university_name_ar?: string;
    university_data_source?: number | null;
  }
) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.university.update({
    where: { university_id: id },
    data: {
      university_name_en: data.university_name_en,
      university_name_ar: data.university_name_ar ?? null,
      university_data_source: data.university_data_source ?? null,
      university_updated_at: new Date(),
    }
  });
  revalidatePath("/admin/university");
}

export async function createUniversity(data: {
  university_name_en: string;
  university_name_ar?: string;
  university_data_source?: number | null;
}) {
  await requireRoleCapability("admin", "admin.system");
  const result = await prisma.university.create({
    data: {
      university_name_en: data.university_name_en,
      university_name_ar: data.university_name_ar ?? null,
      university_data_source: data.university_data_source ?? null,
      university_created_at: new Date(),
      university_updated_at: new Date(),
    }
  });
  revalidatePath("/admin/university");
  return { id: result.university_id };
}

export async function deleteUniversity(id: number) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.university.update({
    where: { university_id: id },
    data: { deleted: 1, university_updated_at: new Date() }
  });
  revalidatePath("/admin/university");
}
