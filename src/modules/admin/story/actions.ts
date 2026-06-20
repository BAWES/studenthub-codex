"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStoriesSchema,
  createStorySchema,
  updateStorySchema,
  deleteStorySchema,
  listStoriesResultSchema,
  storyActionResponseSchema,
} from "./schemas";
import type {
  ListStoriesInput,
  ListStoriesResult,
  StoryItem,
  StoryActionResponse,
} from "./schemas";

export async function listStories(input: ListStoriesInput = {}): Promise<ListStoriesResult> {
  await requireCapability("admin.read");
  const parsed = listStoriesSchema.safeParse(input);
  if (!parsed.success) return { stories: [], total: 0, page: 1, limit: 50, totalPages: 0 };
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
        staff_id: true,
        number_of_employees: true,
        story_status: true,
        is_old: true,
        story_time_spent: true,
        story_last_updated_at: true,
        request: {
          select: { request_position_title: true },
        },
        staff: {
          select: { staff_name: true },
        },
      },
    }),
    prisma.story.count(),
  ]);

  const stories: StoryItem[] = rows.map((row) => ({
    story_uuid: row.story_uuid,
    request_uuid: row.request_uuid,
    request_position_title: row.request?.request_position_title ?? null,
    staff_id: row.staff_id,
    staff_name: row.staff?.staff_name ?? null,
    number_of_employees: row.number_of_employees,
    story_status: row.story_status,
    is_old: row.is_old,
    story_time_spent: row.story_time_spent,
    story_last_updated_at: row.story_last_updated_at
      ? row.story_last_updated_at.toISOString()
      : null,
  }));

  const result = { stories, total, page, limit, totalPages: Math.ceil(total / limit) };
  const outputParsed = listStoriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/story] listStories output validation failed:", outputParsed.error.issues);
  }
  return result;
}

export async function createStory(
  _prevState: unknown,
  formData: FormData,
): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = createStorySchema.safeParse({
    requestUuid: formData.get("requestUuid"),
    staffId: formData.get("staffId"),
    numberOfEmployees: formData.get("numberOfEmployees"),
    storyStatus: formData.get("storyStatus"),
  });
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid story data",
    };
  }
  try {
    await prisma.story.create({
      data: {
        story_uuid: crypto.randomUUID(),
        request_uuid: parsed.data.requestUuid,
        staff_id: parsed.data.staffId ?? null,
        number_of_employees: parsed.data.numberOfEmployees ?? null,
        story_status: parsed.data.storyStatus,
      },
    });
    revalidatePath("/admin/story");
    return { operation: "success", message: "Story created successfully" };
  } catch (_e) {
    return {
      operation: "error",
      message: "Failed to create story. The request UUID may be invalid.",
    };
  }
}

export async function updateStory(
  _prevState: unknown,
  formData: FormData,
): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateStorySchema.safeParse({
    storyUuid: formData.get("storyUuid"),
    requestUuid: formData.get("requestUuid"),
    staffId: formData.get("staffId"),
    numberOfEmployees: formData.get("numberOfEmployees"),
    storyStatus: formData.get("storyStatus"),
    isOld: formData.get("isOld"),
    storyTimeSpent: formData.get("storyTimeSpent"),
  });
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  }
  try {
    const existing = await prisma.story.findUnique({
      where: { story_uuid: parsed.data.storyUuid },
      select: { story_uuid: true },
    });
    if (!existing) return { operation: "error", message: "Story not found" };

    await prisma.story.update({
      where: { story_uuid: parsed.data.storyUuid },
      data: {
        request_uuid: parsed.data.requestUuid,
        staff_id: parsed.data.staffId ?? null,
        number_of_employees: parsed.data.numberOfEmployees ?? null,
        story_status: parsed.data.storyStatus,
        is_old: parsed.data.isOld ?? false,
        story_time_spent: parsed.data.storyTimeSpent ?? null,
      },
    });
    revalidatePath("/admin/story");
    return { operation: "success", message: "Story updated successfully" };
  } catch (_e) {
    return {
      operation: "error",
      message: "Failed to update story.",
    };
  }
}

export async function deleteStory(storyUuid: string): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteStorySchema.safeParse({ storyUuid });
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid story UUID" };
  }
  try {
    const existing = await prisma.story.findUnique({
      where: { story_uuid: parsed.data.storyUuid },
      select: { story_uuid: true },
    });
    if (!existing) return { operation: "error", message: "Story not found" };

    await prisma.story.delete({ where: { story_uuid: parsed.data.storyUuid } });
    revalidatePath("/admin/story");
    return { operation: "success", message: "Story deleted successfully" };
  } catch (_e) {
    return {
      operation: "error",
      message: "Failed to delete story. It may have related records.",
    };
  }
}
