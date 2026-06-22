"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listEventsSchema,
  getEventSchema,
  getEventTimelineSchema,
  listActivityEventsSchema,
  eventItemSchema,
  listEventsResultSchema,
  timelineEntrySchema,
  type ListEventsParams,
  type GetEventParams,
  type GetEventTimelineParams,
  type EventItem,
  type ListEventsResult,
  type TimelineEntry,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List request activity events with pagination and optional filters.
 * Provides admin-level access to all request activity records.
 * Mirrors the legacy Yii2 EventController concepts.
 */
export async function listEvents(
  params: ListEventsParams = {},
): Promise<ListEventsResult> {
  await requireCapability("request.read.any");

  const parsed = listEventsSchema.safeParse(params);
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
  const outputParsed = listEventsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/event] listEvents output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single activity event by UUID.
 *
 * @param params - Object with `id` (activity UUID string)
 * @returns The activity event record, or null if not found
 */
export async function getEvent(
  params: GetEventParams,
): Promise<EventItem | null> {
  await requireCapability("request.read.any");

  const parsed = getEventSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid event ID");
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

  if (!activity) {
    // Validate output shape (null case)
    const nullOutputParsed = eventItemSchema.nullable().safeParse(null);
    if (!nullOutputParsed.success) {
      console.error(
        "[modules/admin/event] getEvent output validation failed:",
        nullOutputParsed.error.issues,
      );
    }
    return null;
  }

  const result = {
    activity_uuid: activity.activity_uuid,
    request_uuid: activity.request_uuid,
    activity_detail: activity.activity_detail,
    staff_name: activity.staff?.staff_name ?? null,
    activity_created_datetime: activity.activity_created_datetime,
    activity_updated_datetime: activity.activity_updated_datetime,
  };

  // Validate output shape
  const outputParsed = eventItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/event] getEvent output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a chronological timeline of events for a specific request,
 * grouped by date. Useful for rendering a timeline view in the admin UI.
 *
 * @param params - Object with `requestUuid` (the request to get events for)
 * @returns Array of timeline entries, each containing a date label and its events
 */
export async function getEventTimeline(
  params: GetEventTimelineParams,
): Promise<TimelineEntry[]> {
  await requireCapability("request.read.any");

  const parsed = getEventTimelineSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request UUID");
  }

  const { requestUuid } = parsed.data;

  const activities = await prisma.request_activity.findMany({
    where: { request_uuid: requestUuid },
    orderBy: { activity_created_datetime: "asc" },
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

  // Group events by date (YYYY-MM-DD)
  const grouped = new Map<string, EventItem[]>();

  for (const a of activities) {
    const eventItem: EventItem = {
      activity_uuid: a.activity_uuid,
      request_uuid: a.request_uuid,
      activity_detail: a.activity_detail,
      staff_name: a.staff?.staff_name ?? null,
      activity_created_datetime: a.activity_created_datetime,
      activity_updated_datetime: a.activity_updated_datetime,
    };

    const dateKey = a.activity_created_datetime
      ? a.activity_created_datetime.toISOString().split("T")[0]
      : "unknown";

    const existing = grouped.get(dateKey);
    if (existing) {
      existing.push(eventItem);
    } else {
      grouped.set(dateKey, [eventItem]);
    }
  }

  // Convert to sorted array (newest date first)
  const timeline: TimelineEntry[] = Array.from(grouped.entries())
    .map(([date, events]) => ({ date, events }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Validate output shape
  const outputParsed = z.array(timelineEntrySchema).safeParse(timeline);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/event] getEventTimeline output validation failed:",
      outputParsed.error.issues,
    );
  }

  return timeline;
}
