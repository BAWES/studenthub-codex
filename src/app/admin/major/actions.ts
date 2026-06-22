"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getMajorDetail(id: string) {
  await requireRoleCapability("admin", "admin.system");
  return prisma.major.findUnique({
    where: { major_uuid: id },
    select: {
      major_uuid: true,
      major_name_en: true,
      major_name_ar: true,
      data_source: true,
      major_created_at: true,
      major_updated_at: true,
    }
  });
}

export async function updateMajor(
  id: string,
  data: {
    major_name_en: string;
    major_name_ar: string;
    data_source?: number | null;
  }
) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.major.update({
    where: { major_uuid: id },
    data: {
      major_name_en: data.major_name_en,
      major_name_ar: data.major_name_ar,
      data_source: data.data_source ?? null,
      major_updated_at: new Date(),
    }
  });
  revalidatePath("/admin/major");
}

export async function createMajor(data: {
  major_name_en: string;
  major_name_ar: string;
  data_source?: number | null;
}) {
  await requireRoleCapability("admin", "admin.system");
  const uuid = crypto.randomUUID();
  await prisma.major.create({
    data: {
      major_uuid: uuid,
      major_name_en: data.major_name_en,
      major_name_ar: data.major_name_ar,
      data_source: data.data_source ?? null,
      major_created_at: new Date(),
      major_updated_at: new Date(),
    }
  });
  revalidatePath("/admin/major");
  return { uuid };
}

export async function deleteMajor(id: string) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.major.delete({
    where: { major_uuid: id }
  });
  revalidatePath("/admin/major");
}
