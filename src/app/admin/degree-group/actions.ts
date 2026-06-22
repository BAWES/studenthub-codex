"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getDegreeGroupDetail(degreeGroupUuid: string) {
  await requireRoleCapability("admin", "admin.system");

  const group = await prisma.degree_group.findUnique({
    where: { degree_group_uuid: degreeGroupUuid },
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

  return group;
}

export async function updateDegreeGroup(
  degreeGroupUuid: string,
  data: {
    degree_group_name_en: string;
    degree_group_name_ar?: string;
    degree_group_sort_order?: number;
    skip_major?: number | null;
  }
) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.degree_group.update({
    where: { degree_group_uuid: degreeGroupUuid },
    data: {
      degree_group_name_en: data.degree_group_name_en,
      degree_group_name_ar: data.degree_group_name_ar ?? null,
      degree_group_sort_order: data.degree_group_sort_order ?? 0,
      skip_major: data.skip_major ?? null,
      degree_group_updated_at: new Date()
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
      degree_group_updated_at: new Date()
    }
  });

  revalidatePath("/admin/degree-group");
  return { uuid };
}

export async function deleteDegreeGroup(degreeGroupUuid: string) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.degree_group.delete({
    where: { degree_group_uuid: degreeGroupUuid }
  });

  revalidatePath("/admin/degree-group");
}
