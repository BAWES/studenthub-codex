"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  storyActivityItemSchema,
  listStoryActivitiesResultSchema,
  logStoryActivityResultSchema,
  updateStoryActivityResultSchema,
  type StoryActivityItem,
  type ListStoryActivitiesResult,
  type LogStoryActivityResult,
  type UpdateStoryActivityResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStoryActivitiesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  storyUuid: z.string().optional(),
  staffId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).optional(),
});

const getStoryActivitySchema = z.object({
  storyActivityUuid: z.string().min(1, "Story activity UUID is required"),
});

const logStoryActivitySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  staffId: z.coerce.number().int().positive("Staff ID must be a positive integer"),
  activityTimeSpent: z.coerce.number().int().nonnegative().optional(),
  activityStatus: z.coerce.number().int().min(0).optional().default(0),
});

const updateStoryActivitySchema = z.object({
  storyActivityUuid: z.string().min(1, "Story activity UUID is required"),
  activityTimeSpent: z.coerce.number().int().nonnegative().optional(),
  activityStatus: z.coerce.number().int().min(0).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapStoryActivity(raw: any): StoryActivityItem {
  return {
    story_activity_uuid: raw.story_activity_uuid,
    story_uuid: raw.story_uuid,
    staff_id: raw.staff_id ?? null,
    activity_time_spent: raw.activity_time_spent ?? null,
    activity_status: raw.activity_status ?? 0,
    activity_created_at: raw.activity_created_at?.toISOString() ?? null,
    activity_last_updated_at: raw.activity_last_updated_at?.toISOString() ?? null,
  };
}

function buildWhereFilters(params: {
  storyUuid?: string;
  staffId?: number;
  status?: number;
}) {
  const where: Record<string, any> = {};
  if (params.storyUuid !== undefined) {
    where.story_uuid = params.storyUuid;
  }
  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }
  if (params.status !== undefined) {
    where.activity_status = params.status;
  }
  return where;
}

function generateUuid(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// listStoryActivities
// ---------------------------------------------------------------------------

/**
 * List story activities with pagination and optional filters.
 * Mirrors the legacy Yii2 pattern for tracking staff activity on stories.
 */
export async function listStoryActivities(
  params: FormData | z.input<typeof listStoryActivitiesSchema> = {},
): Promise<ListStoryActivitiesResult> {
  await requireCapability("story.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          storyUuid: params.get("storyUuid"),
          staffId: params.get("staffId"),
          status: params.get("status"),
        }
      : params;

  const parsed = listStoryActivitiesSchema.safeParse(raw);
  if (!parsed.success) {
    return { activities: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, storyUuid, staffId, status } = parsed.data;
  const skip = (page - 1) * limit;
  const where = buildWhereFilters({ storyUuid, staffId, status });

  const [activities, total] = await Promise.all([
    prisma.story_activity.findMany({
      where,
      orderBy: { activity_last_updated_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.story_activity.count({ where }),
  ]);

  const result: ListStoryActivitiesResult = {
    activities: activities.map(mapStoryActivity),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listStoryActivitiesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/story-activities] listStoryActivities output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getStoryActivity
// ---------------------------------------------------------------------------

/**
 * Get a single story activity by UUID.
 * Returns null if not found.
 */
export async function getStoryActivity(
  storyActivityUuid: string,
): Promise<StoryActivityItem | null> {
  await requireCapability("story.read");

  const parsed = getStoryActivitySchema.safeParse({ storyActivityUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid story activity UUID");
  }

  const activity = await prisma.story_activity.findFirst({
    where: { story_activity_uuid: parsed.data.storyActivityUuid },
  });

  if (!activity) return null;

  const result: StoryActivityItem = mapStoryActivity(activity);

  const outputParsed = storyActivityItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/story-activities] getStoryActivity output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// logStoryActivity
// ---------------------------------------------------------------------------

/**
 * Log a new story activity record (time spent / status change).
 * Creates a new record with a generated UUID.
 */
export async function logStoryActivity(
  data: z.input<typeof logStoryActivitySchema>,
): Promise<LogStoryActivityResult> {
  await requireCapability("story.write");

  const parsed = logStoryActivitySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid story activity data");
  }

  const { storyUuid, staffId, activityTimeSpent, activityStatus } = parsed.data;
  const uuid = generateUuid();
  const now = new Date();

  const activity = await prisma.story_activity.create({
    data: {
      story_activity_uuid: uuid,
      story_uuid: storyUuid,
      staff_id: staffId,
      activity_time_spent: activityTimeSpent ?? null,
      activity_status: activityStatus,
      activity_created_at: now,
      activity_last_updated_at: now,
    } as any,
  });

  const result: LogStoryActivityResult = {
    story_activity_uuid: activity.story_activity_uuid,
    story_uuid: activity.story_uuid,
    activity_status: activity.activity_status,
  };

  const outputParsed = logStoryActivityResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/story-activities] logStoryActivity output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateStoryActivity
// ---------------------------------------------------------------------------

/**
 * Update a story activity record (time spent, status).
 * Only provided fields are updated.
 */
export async function updateStoryActivity(
  data: z.input<typeof updateStoryActivitySchema>,
): Promise<UpdateStoryActivityResult> {
  await requireCapability("story.write");

  const parsed = updateStoryActivitySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid story activity data");
  }

  const { storyActivityUuid, activityTimeSpent, activityStatus } = parsed.data;

  const updateData: Record<string, any> = {
    activity_last_updated_at: new Date(),
  };
  if (activityTimeSpent !== undefined) {
    updateData.activity_time_spent = activityTimeSpent;
  }
  if (activityStatus !== undefined) {
    updateData.activity_status = activityStatus;
  }

  const activity = await prisma.story_activity.update({
    where: { story_activity_uuid: storyActivityUuid },
    data: updateData as any,
  });

  const result: UpdateStoryActivityResult = {
    story_activity_uuid: activity.story_activity_uuid,
    activity_status: activity.activity_status,
    activity_time_spent: activity.activity_time_spent,
  };

  const outputParsed = updateStoryActivityResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/story-activities] updateStoryActivity output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
