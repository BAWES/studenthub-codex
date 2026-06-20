"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStorySchema,
  createStorySchema,
  updateStorySchema,
  deleteStorySchema,
  listStoryResultSchema,
  storyActionResponseSchema,
} from "./schemas";
import type {
  ListStoryInput,
  ListStoryResult,
  StoryActionResponse,
} from "./schemas";

export async function listStories(
  input: ListStoryInput = {},
): Promise<ListStoryResult> {
  await requireCapability("admin.read");
  const parsed = listStorySchema.safeParse(input);
  if (!parsed.success)
    return { stories: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.story.findMany({
      orderBy: { story_last_updated_at: "desc" },
      skip,
      take: limit,
      include: {
        request: { select: { request_position_title: true } },
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.story.count(),
  ]);

  const stories = rows.map((row) => ({
    story_uuid: row.story_uuid,
    request_uuid: row.request_uuid,
    request_position_title: row.request?.request_position_title ?? null,
    staff_id: row.staff_id,
    staff_name: row.staff?.staff_name ?? null,
    number_of_employees: row.number_of_employees,
    story_status: row.story_status,
    is_old: row.is_old,
    story_time_spent: row.story_time_spent,
    story_created_at: row.story_created_at,
    story_last_updated_at: row.story_last_updated_at,
  }));

  const result = {
    stories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listStoryResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/story] listStories output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function createStory(
  _prev: unknown,
  formData: FormData,
): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = createStorySchema.safeParse({
    requestUuid: formData.get("requestUuid"),
    staffId: formData.get("staffId") || undefined,
    numberOfEmployees: formData.get("numberOfEmployees") || undefined,
    storyStatus: formData.get("storyStatus") || "0",
    isOld: formData.get("isOld") || undefined,
    storyTimeSpent: formData.get("storyTimeSpent") || undefined,
  });
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const data = parsed.data;
    await prisma.story.create({
      data: {
        story_uuid: crypto.randomUUID(),
        request_uuid: data.requestUuid,
        staff_id: data.staffId ?? null,
        number_of_employees: data.numberOfEmployees ?? null,
        story_status: data.storyStatus,
        is_old: data.isOld ?? null,
        story_time_spent: data.storyTimeSpent ?? null,
      },
    });
    revalidatePath("/admin/story");
    const result = {
      operation: "success",
      message: "Story created successfully",
    };
    const outputParsed = storyActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/story] createStory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem creating the story, please contact us for assistance.",
    };
    const outputParsed = storyActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/story] createStory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function updateStory(
  _prev: unknown,
  formData: FormData,
): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateStorySchema.safeParse({
    storyUuid: formData.get("storyUuid"),
    staffId: formData.get("staffId") || undefined,
    numberOfEmployees: formData.get("numberOfEmployees") || undefined,
    storyStatus: formData.get("storyStatus") || "0",
    isOld: formData.get("isOld") || undefined,
    storyTimeSpent: formData.get("storyTimeSpent") || undefined,
  });
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const data = parsed.data;
    const existing = await prisma.story.findUnique({
      where: { story_uuid: data.storyUuid },
      select: { story_uuid: true },
    });
    if (!existing)
      return { operation: "error", message: "Story not found" };

    await prisma.story.update({
      where: { story_uuid: data.storyUuid },
      data: {
        staff_id: data.staffId ?? null,
        number_of_employees: data.numberOfEmployees ?? null,
        story_status: data.storyStatus,
        is_old: data.isOld ?? null,
        story_time_spent: data.storyTimeSpent ?? null,
      },
    });
    revalidatePath("/admin/story");
    const result = {
      operation: "success",
      message: "Story updated successfully",
    };
    const outputParsed = storyActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/story] updateStory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem updating the story, please contact us for assistance.",
    };
    const outputParsed = storyActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/story] updateStory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function deleteStory(
  storyUuid: string,
): Promise<StoryActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteStorySchema.safeParse({ storyUuid });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid story UUID",
    };

  try {
    const existing = await prisma.story.findUnique({
      where: { story_uuid: parsed.data.storyUuid },
      select: { story_uuid: true },
    });
    if (!existing)
      return { operation: "error", message: "Story not found" };

    await prisma.story.delete({
      where: { story_uuid: parsed.data.storyUuid },
    });
    revalidatePath("/admin/story");
    const result = {
      operation: "success",
      message: "Story deleted successfully",
    };
    const outputParsed = storyActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/story] deleteStory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem deleting the story, please contact us for assistance.",
    };
    const outputParsed = storyActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/story] deleteStory output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function listStoryStaff(): Promise<
  { staff_id: number; staff_name: string }[]
> {
  await requireCapability("admin.read");
  const rows = await prisma.staff.findMany({
    where: { deleted: 0 },
    orderBy: { staff_name: "asc" },
    select: { staff_id: true, staff_name: true },
  });
  return rows;
}
