"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getStoryDetail(storyUuid: string) {
  await requireRoleCapability("admin", "admin.system");

  const story = await prisma.story.findUnique({
    where: { story_uuid: storyUuid },
    select: {
      story_uuid: true,
      request_uuid: true,
      number_of_employees: true,
      story_status: true,
      story_time_spent: true,
      story_created_at: true,
      story_last_updated_at: true,
      request: { select: { request_uuid: true, request_position_title: true } },
      staff: { select: { staff_id: true, staff_name: true } }
    }
  });

  return story;
}

export async function updateStory(
  storyUuid: string,
  data: {
    number_of_employees?: number | null;
    story_status?: number;
    story_time_spent?: number | null;
  }
) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.story.update({
    where: { story_uuid: storyUuid },
    data: {
      number_of_employees: data.number_of_employees ?? undefined,
      story_status: data.story_status ?? 0,
      story_time_spent: data.story_time_spent ?? undefined,
      story_last_updated_at: new Date()
    }
  });

  revalidatePath("/admin/story");
}

export async function deleteStory(storyUuid: string) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.story.delete({
    where: { story_uuid: storyUuid }
  });

  revalidatePath("/admin/story");
}
