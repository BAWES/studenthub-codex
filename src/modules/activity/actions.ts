"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listActivitySchema = z.object({
  requestUuid: z.string().min(1).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const getActivitySchema = z.object({
  uuid: z.string().min(1, "Activity UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListActivityParams = z.input<typeof listActivitySchema>;
export type GetActivityParams = z.input<typeof getActivitySchema>;

export type RequestActivityItem = {
  activity_uuid: string;
  request_uuid: string;
  staff_id: number | null;
  activity_detail: string;
  activity_created_datetime: string | null;
  activity_updated_datetime: string | null;
};

export type ListActivityResult = {
  activities: RequestActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List request activities with optional requestUuid filter and pagination.
 * Mirrors the legacy Yii2 RequestActivityController::actionList().
 *
 * Activities are ordered by most recent first (the common view pattern).
 */
export async function listActivity(
  params: ListActivityParams = {},
): Promise<ListActivityResult> {
  await requireCapability("app.access");

  const parsed = listActivitySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { requestUuid, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Prisma.request_activityWhereInput = {};
  if (requestUuid) {
    where.request_uuid = requestUuid;
  }

  const [items, total] = await Promise.all([
    prisma.request_activity.findMany({
      where,
      orderBy: { activity_created_datetime: "desc" },
      skip,
      take: limit,
    }),
    prisma.request_activity.count({ where }),
  ]);

  return {
    activities: items.map((a) => ({
      activity_uuid: a.activity_uuid,
      request_uuid: a.request_uuid,
      staff_id: a.staff_id ?? null,
      activity_detail: a.activity_detail,
      activity_created_datetime: a.activity_created_datetime?.toISOString() ?? null,
      activity_updated_datetime: a.activity_updated_datetime?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single request activity by its UUID.
 * Mirrors the legacy Yii2 RequestActivityController::actionView($id).
 */
export async function getActivity(
  params: GetActivityParams,
): Promise<RequestActivityItem> {
  await requireCapability("app.access");

  const parsed = getActivitySchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { uuid } = parsed.data;

  const activity = await prisma.request_activity.findUnique({
    where: { activity_uuid: uuid },
  });

  if (!activity) {
    throw new Error("Request activity not found");
  }

  return {
    activity_uuid: activity.activity_uuid,
    request_uuid: activity.request_uuid,
    staff_id: activity.staff_id ?? null,
    activity_detail: activity.activity_detail,
    activity_created_datetime: activity.activity_created_datetime?.toISOString() ?? null,
    activity_updated_datetime: activity.activity_updated_datetime?.toISOString() ?? null,
  };
}
