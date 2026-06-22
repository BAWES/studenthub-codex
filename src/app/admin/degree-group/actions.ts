"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getDegreeGroupDetail(id: string) {
  await requireRoleCapability("admin", "admin.system");
  return prisma.degree_group.findUnique({
    where: { degree_group_uuid: id },
    select: {
      degree_group_uuid: true,
      degree_group_name_en: true,
      degree_group_name_ar: true,
      degree_group_sort_order: true,
      skip_major: true,
      degree_group_created_at: true,
      degree_group_updated_at: true,
    }
  });
}

export async function updateDegreeGroup(
  id: string,
  data: {
    degree_group_name_en: string;
    degree_group_name_ar?: string;
    degree_group_sort_order?: number;
    skip_major?: number | null;
  }
) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.degree_group.update({
    where: { degree_group_uuid: id },
    data: {
      degree_group_name_en: data.degree_group_name_en,
      degree_group_name_ar: data.degree_group_name_ar ?? null,
      degree_group_sort_order: data.degree_group_sort_order ?? 0,
      skip_major: data.skip_major ?? null,
      degree_group_updated_at: new Date(),
    }
  });
  revalidatePath("/admin/degree-group");
}

export async function createDegreeGroup(data: {
  degree_group_name_en: string;
  degree_group_name_ar?: string;
  degree_group_sort_order?: number;
  skip_major?: number | null;
}) {
  await requireRoleCapability("admin", "admin.system");
  const uuid = crypto.randomUUID();
  await prisma.degree_group.create({
    data: {
      degree_group_uuid: uuid,
      degree_group_name_en: data.degree_group_name_en,
      degree_group_name_ar: data.degree_group_name_ar ?? null,
      degree_group_sort_order: data.degree_group_sort_order ?? 0,
      skip_major: data.skip_major ?? null,
      degree_group_created_at: new Date(),
      degree_group_updated_at: new Date(),
    }
  });
  revalidatePath("/admin/degree-group");
  return { uuid };
}

export async function deleteDegreeGroup(id: string) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.degree_group.delete({
    where: { degree_group_uuid: id }
  });
  revalidatePath("/admin/degree-group");
}

export async function getDegreeGroupOptions(): Promise<{ degree_group_uuid: string; degree_group_name_en: string }[]> {
  await requireRoleCapability("admin", "admin.system");
  return prisma.degree_group.findMany({
    orderBy: { degree_group_sort_order: "asc" },
    select: { degree_group_uuid: true, degree_group_name_en: true }
  });
}
