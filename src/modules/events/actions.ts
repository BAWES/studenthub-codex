"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listActivityEventsSchema,
  getActivityEventSchema,
  activityEventItemSchema,
  listActivityEventsResultSchema,
  type ListActivityEventsParams,
  type GetActivityEventParams,
  type ActivityEventItem,
  type ListActivityEventsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List request activity events with pagination and optional filters.
 * Mirrors the event/activity log concept from the legacy Yii2 system.
 */
export async function listActivityEvents(
  params: ListActivityEventsParams = {},
): Promise<ListActivityEventsResult> {
  await requireCapability("request.read.any");

  const parsed = listActivityEventsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { requestUuid, dateFrom, dateTo, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};

  if (requestUuid) {
    where.request_uuid = requestUuid;
  }
  if (dateFrom || dateTo) {
    const createdAt: Record<string, unknown> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.activity_created_datetime = createdAt;
  }

  const [activities, total] = await Promise.all([
    prisma.request_activity.findMany({
      where: where as any,
      orderBy: { activity_created_datetime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        activity_uuid: true,
        request_uuid: true,
        activity_detail: true,
        activity_created_datetime: true,
        activity_updated_datetime: true,
        staff: {
          select: { staff_name: true },
        },
      },
    }),
    prisma.request_activity.count({ where: where as any }),
  ]);

  const result = {
    events: activities.map((a) => ({
      activity_uuid: a.activity_uuid,
      request_uuid: a.request_uuid,
      activity_detail: a.activity_detail,
      staff_name: a.staff?.staff_name ?? null,
      activity_created_datetime: a.activity_created_datetime,
      activity_updated_datetime: a.activity_updated_datetime,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listActivityEventsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/events] listActivityEvents output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single activity event by UUID. Returns null if not found.
 * Mirrors the view concept from the legacy Yii2 event system.
 *
 * @param params - Object with `id` (activity UUID string)
 * @returns The activity event record, or null if not found
 */
export async function getActivityEvent(
  params: GetActivityEventParams,
): Promise<ActivityEventItem | null> {
  await requireCapability("request.read.any");

  const parsed = getActivityEventSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid activity event ID");
  }

  const { id } = parsed.data;

  const activity = await prisma.request_activity.findFirst({
    where: { activity_uuid: id },
    select: {
      activity_uuid: true,
      request_uuid: true,
      activity_detail: true,
      activity_created_datetime: true,
      activity_updated_datetime: true,
      staff: {
        select: { staff_name: true },
      },
    },
  });

  if (!activity) return null;

  const item = {
    activity_uuid: activity.activity_uuid,
    request_uuid: activity.request_uuid,
    activity_detail: activity.activity_detail,
    staff_name: activity.staff?.staff_name ?? null,
    activity_created_datetime: activity.activity_created_datetime,
    activity_updated_datetime: activity.activity_updated_datetime,
  };

  // Validate output shape
  const outputParsed = activityEventItemSchema.safeParse(item);
  if (!outputParsed.success) {
    console.error(
      "[modules/events] getActivityEvent output validation failed:",
      outputParsed.error.issues,
    );
  }

  return item;
}
