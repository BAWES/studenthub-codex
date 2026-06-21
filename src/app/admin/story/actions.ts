"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function listStories(params?: { limit?: number; offset?: number }) {
  await requireRoleCapability("admin", "admin.system");

  const limit = params?.limit ?? 60;
  const offset = params?.offset ?? 0;

  const [records, total] = await Promise.all([
    prisma.story.findMany({
      orderBy: { story_created_at: "desc" },
      take: limit,
      skip: offset,
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
        staff: { select: { staff_name: true } },
        request: {
          select: {
            request_position_title: true,
            company: { select: { company_name: true } }
          }
        }
      }
    }),
    prisma.story.count()
  ]);

  return {
    records,
    total,
    limit,
    offset
  };
}

export async function getStoryDetail(storyUuid: string) {
  await requireRoleCapability("admin", "admin.system");

  const story = await prisma.story.findUnique({
    where: { story_uuid: storyUuid },
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
      staff: { select: { staff_id: true, staff_name: true } },
      request: {
        select: {
          request_position_title: true,
          request_status: true,
          company: { select: { company_name: true, company_id: true } }
        }
      },
      story_activity: {
        orderBy: { activity_created_at: "desc" },
        take: 10,
        select: {
          story_activity_uuid: true,
          activity_status: true,
          activity_time_spent: true,
          activity_created_at: true,
          activity_last_updated_at: true,
          staff: { select: { staff_name: true } }
        }
      }
    }
  });

  return story;
}

export async function updateStory(
  storyUuid: string,
  data: {
    number_of_employees?: number;
    story_status?: number;
    story_time_spent?: number;
  }
) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.story.update({
    where: { story_uuid: storyUuid },
    data: {
      number_of_employees: data.number_of_employees,
      story_status: data.story_status,
      story_time_spent: data.story_time_spent,
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
