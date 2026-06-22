"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getStoryDetail(id: string) {
  await requireRoleCapability("admin", "admin.system");
  return prisma.story.findUnique({
    where: { story_uuid: id },
    select: {
      story_uuid: true,
      request_uuid: true,
      suggestion_uuid: true,
      staff_id: true,
      number_of_employees: true,
      story_status: true,
      is_old: true,
      story_time_spent: true,
      story_created_at: true,
      story_last_updated_at: true,
    }
  });
}

export async function updateStory(
  id: string,
  data: {
    story_status?: number;
    number_of_employees?: number | null;
    story_time_spent?: number | null;
    is_old?: boolean;
  }
) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.story.update({
    where: { story_uuid: id },
    data: {
      ...data,
      story_last_updated_at: new Date(),
    }
  });
  revalidatePath("/admin/story");
}

export async function deleteStory(id: string) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.story.update({
    where: { story_uuid: id },
    data: { story_status: -1, story_last_updated_at: new Date() }
  });
  revalidatePath("/admin/story");
}
