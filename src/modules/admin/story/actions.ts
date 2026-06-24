"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStoriesSchema,
  listStoriesResultSchema,
} from "./schemas";
import type { ListStoriesInput, ListStoriesResult } from "./schemas";

type StoryActionResponse = { operation: string; message: string };

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

// ── Stub CRUD actions for admin story table ──────────────────────────

export async function createStory(
  _prevState: unknown,
  formData: FormData,
): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  const requestUuid = String(formData.get("requestUuid") ?? "");
  const staffId = formData.get("staffId") ? Number(formData.get("staffId")) : null;
  const numberOfEmployees = formData.get("numberOfEmployees")
    ? Number(formData.get("numberOfEmployees"))
    : null;
  const storyStatus = Number(formData.get("storyStatus") ?? 0);

  try {
    await prisma.story.create({
      data: {
        request_uuid: requestUuid,
        staff_id: staffId,
        number_of_employees: numberOfEmployees,
        story_status: storyStatus,
        story_uuid: crypto.randomUUID(),
      },
    });
    return { operation: "success", message: "Story created" };
  } catch (err) {
    return { operation: "error", message: String(err) };
  }
}

export async function updateStory(
  _prevState: unknown,
  formData: FormData,
): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  const storyUuid = String(formData.get("storyUuid") ?? "");
  const requestUuid = String(formData.get("requestUuid") ?? "");
  const staffId = formData.get("staffId") ? Number(formData.get("staffId")) : null;
  const numberOfEmployees = formData.get("numberOfEmployees")
    ? Number(formData.get("numberOfEmployees"))
    : null;
  const storyStatus = Number(formData.get("storyStatus") ?? 0);
  const storyTimeSpent = formData.get("storyTimeSpent")
    ? Number(formData.get("storyTimeSpent"))
    : null;

  try {
    await prisma.story.update({
      where: { story_uuid: storyUuid },
      data: {
        request_uuid: requestUuid,
        staff_id: staffId,
        number_of_employees: numberOfEmployees,
        story_status: storyStatus,
        story_time_spent: storyTimeSpent,
      },
    });
    return { operation: "success", message: "Story updated" };
  } catch (err) {
    return { operation: "error", message: String(err) };
  }
}

export async function deleteStory(storyUuid: string): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  try {
    await prisma.story.delete({ where: { story_uuid: storyUuid } });
    return { operation: "success", message: "Story deleted" };
  } catch (err) {
    return { operation: "error", message: String(err) };
  }
}
