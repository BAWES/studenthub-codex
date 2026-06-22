"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  storyListItemSchema,
  listStoriesResultSchema,
  assignStoryResultSchema,
  updateStoryStatusResultSchema,
  type StoryListItem,
  type ListStoriesResult,
  type AssignStoryResult,
  type UpdateStoryStatusResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  status: z.coerce.number().int().min(0).optional(),
});

const getStorySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
});

const assignStorySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  staffId: z.coerce.number().int().positive("Staff ID must be a positive integer"),
});

const updateStoryStatusSchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  status: z.coerce.number().int().min(0, "Status must be a non-negative integer"),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapStory(raw: any): StoryListItem {
  return {
    story_uuid: raw.story_uuid,
    request_uuid: raw.request_uuid,
    suggestion_uuid: raw.suggestion_uuid ?? null,
    staff_id: raw.staff_id ?? null,
    number_of_employees: raw.number_of_employees ?? null,
    story_status: raw.story_status ?? 0,
    is_old: raw.is_old ?? null,
    story_time_spent: raw.story_time_spent ?? null,
    story_created_at: raw.story_created_at?.toISOString() ?? null,
    story_last_updated_at: raw.story_last_updated_at?.toISOString() ?? null,
  };
}

function buildWhereFilters(params: {
  staffId?: number;
  requestUuid?: string;
  status?: number;
}) {
  const where: Record<string, any> = {};
  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }
  if (params.requestUuid !== undefined) {
    where.request_uuid = params.requestUuid;
  }
  if (params.status !== undefined) {
    where.story_status = params.status;
  }
  return where;
}

// ---------------------------------------------------------------------------
// listStories
// ---------------------------------------------------------------------------

/**
 * List stories with pagination and optional filters.
 * Mirrors the legacy Yii2 StoryController::actionIndex().
 */
export async function listStories(
  params: FormData | z.input<typeof listStoriesSchema> = {},
): Promise<ListStoriesResult> {
  await requireCapability("story.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          staffId: params.get("staffId"),
          requestUuid: params.get("requestUuid"),
          status: params.get("status"),
        }
      : params;

  const parsed = listStoriesSchema.safeParse(raw);
  if (!parsed.success) {
    return { stories: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, staffId, requestUuid, status } = parsed.data;
  const skip = (page - 1) * limit;
  const where = buildWhereFilters({ staffId, requestUuid, status });

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where,
      orderBy: { story_created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.story.count({ where }),
  ]);

  const result: ListStoriesResult = {
    stories: stories.map(mapStory),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listStoriesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/stories] listStories output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getStory
// ---------------------------------------------------------------------------

/**
 * Get a single story by UUID.
 * Returns null if not found.
 */
export async function getStory(
  storyUuid: string,
): Promise<StoryListItem | null> {
  await requireCapability("story.read");

  const parsed = getStorySchema.safeParse({ storyUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid story UUID");
  }

  const story = await prisma.story.findFirst({
    where: { story_uuid: parsed.data.storyUuid },
  });

  if (!story) return null;

  const result: StoryListItem = mapStory(story);

  const outputParsed = storyListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/stories] getStory output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// assignStory
// ---------------------------------------------------------------------------

/**
 * Assign a story to a staff member.
 * Updates the staff_id on the story record.
 */
export async function assignStory(
  data: z.input<typeof assignStorySchema>,
): Promise<AssignStoryResult> {
  await requireCapability("story.write");

  const parsed = assignStorySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid assignment data");
  }

  const { storyUuid, staffId } = parsed.data;

  const story = await prisma.story.update({
    where: { story_uuid: storyUuid },
    data: {
      staff_id: staffId,
      story_last_updated_at: new Date(),
    } as any,
  });

  const result: AssignStoryResult = {
    story_uuid: story.story_uuid,
    staff_id: story.staff_id!,
  };

  const outputParsed = assignStoryResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/stories] assignStory output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateStoryStatus
// ---------------------------------------------------------------------------

/**
 * Update the status of a story.
 * Values: 0=New, 1=In Progress, 2=Completed, 3=Cancelled.
 */
export async function updateStoryStatus(
  data: z.input<typeof updateStoryStatusSchema>,
): Promise<UpdateStoryStatusResult> {
  await requireCapability("story.write");

  const parsed = updateStoryStatusSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid status data");
  }

  const { storyUuid, status } = parsed.data;

  const story = await prisma.story.update({
    where: { story_uuid: storyUuid },
    data: {
      story_status: status,
      story_last_updated_at: new Date(),
    } as any,
  });

  const result: UpdateStoryStatusResult = {
    story_uuid: story.story_uuid,
    story_status: story.story_status,
  };

  const outputParsed = updateStoryStatusResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/stories] updateStoryStatus output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
