"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStoriesSchema,
  listStoriesResultSchema,
} from "./schemas";
import type { ListStoriesInput, ListStoriesResult } from "./schemas";

export async function listStories(
  input: ListStoriesInput = {},
): Promise<ListStoriesResult> {
  await requireCapability("admin.read");
  const parsed = listStoriesSchema.safeParse(input);
  if (!parsed.success)
    return { stories: [], total: 0, page: 1, limit: 50, totalPages: 0 };

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.story.findMany({
      orderBy: { story_last_updated_at: "desc" },
      skip,
      take: limit,
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
      },
    }),
    prisma.story.count(),
  ]);

  const stories = rows.map((row) => ({
    ...row,
    staff_id: row.staff_id ?? null,
    suggestion_uuid: row.suggestion_uuid ?? null,
    is_old: row.is_old ?? null,
  }));

  const result = {
    stories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listStoriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/story] listStories output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
