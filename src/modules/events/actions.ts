"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listActivityEventsSchema = z.object({
  requestUuid: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListActivityEventsParams = z.input<typeof listActivityEventsSchema>;

export type ActivityEventItem = {
  activity_uuid: string;
  request_uuid: string;
  activity_detail: string;
  staff_name: string | null;
  activity_created_datetime: Date | null;
  activity_updated_datetime: Date | null;
};

export type ListActivityEventsResult = {
  events: ActivityEventItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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

  return {
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
}
