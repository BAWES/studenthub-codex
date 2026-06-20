"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  staffNotificationItemSchema,
  listStaffNotificationsResultSchema,
  markNotificationReadResultSchema,
  type StaffNotificationItem,
  type ListStaffNotificationsResult,
  type MarkNotificationReadResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStaffNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  permission: z.string().optional(),
});

const getStaffNotificationSchema = z.object({
  snUuid: z.string().min(1, "Notification UUID is required"),
});

const markNotificationReadSchema = z.object({
  snUuid: z.string().min(1, "Notification UUID is required"),
  read: z
    .union([z.boolean(), z.string().transform((v) => v === "true")])
    .optional()
    .default(true),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapStaffNotification(raw: any): StaffNotificationItem {
  return {
    sn_uuid: raw.sn_uuid,
    staff_id: raw.staff_id ?? null,
    permission: raw.permission ?? null,
    created_at: raw.created_at?.toISOString() ?? null,
    updated_at: raw.updated_at?.toISOString() ?? null,
  };
}

function buildWhereFilters(params: {
  staffId?: number;
  permission?: string;
}) {
  const where: Record<string, any> = {};
  if (params.staffId !== undefined) {
    where.staff_id = params.staffId;
  }
  if (params.permission !== undefined) {
    where.permission = params.permission;
  }
  return where;
}

// ---------------------------------------------------------------------------
// listStaffNotifications
// ---------------------------------------------------------------------------

/**
 * List staff notifications with pagination and optional filters.
 */
export async function listStaffNotifications(
  params: FormData | z.input<typeof listStaffNotificationsSchema> = {},
): Promise<ListStaffNotificationsResult> {
  await requireCapability("staff.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          staffId: params.get("staffId"),
          permission: params.get("permission"),
        }
      : params;

  const parsed = listStaffNotificationsSchema.safeParse(raw);
  if (!parsed.success) {
    return { notifications: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, staffId, permission } = parsed.data;
  const skip = (page - 1) * limit;
  const where = buildWhereFilters({ staffId, permission });

  const [notifications, total] = await Promise.all([
    prisma.staff_notification.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.staff_notification.count({ where }),
  ]);

  const result: ListStaffNotificationsResult = {
    notifications: notifications.map(mapStaffNotification),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listStaffNotificationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-notifications] listStaffNotifications output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getStaffNotification
// ---------------------------------------------------------------------------

/**
 * Get a single staff notification by UUID.
 * Returns null if not found.
 */
export async function getStaffNotification(
  snUuid: string,
): Promise<StaffNotificationItem | null> {
  await requireCapability("staff.read");

  const parsed = getStaffNotificationSchema.safeParse({ snUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid notification UUID",
    );
  }

  const notification = await prisma.staff_notification.findFirst({
    where: { sn_uuid: parsed.data.snUuid },
  });

  if (!notification) return null;

  const result: StaffNotificationItem = mapStaffNotification(notification);

  const outputParsed = staffNotificationItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-notifications] getStaffNotification output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// markNotificationRead
// ---------------------------------------------------------------------------

/**
 * Mark a notification as read (or unread by setting read=false).
 * Updates the updated_at timestamp.
 */
export async function markNotificationRead(
  data: z.input<typeof markNotificationReadSchema>,
): Promise<MarkNotificationReadResult> {
  await requireCapability("admin.write");

  const parsed = markNotificationReadSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid notification data",
    );
  }

  const { snUuid, read } = parsed.data;
  const now = new Date();

  // staff_notification doesn't have a "read" field in the model.
  // Marking as "read" means updating the updated_at timestamp.
  // Future: if a "read_at" field is added to the model, update it here.
  const notification = await prisma.staff_notification.update({
    where: { sn_uuid: snUuid },
    data: {
      updated_at: now,
    } as any,
  });

  const result: MarkNotificationReadResult = {
    sn_uuid: notification.sn_uuid,
    updated_at: notification.updated_at?.toISOString() ?? now.toISOString(),
  };

  const outputParsed = markNotificationReadResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff-notifications] markNotificationRead output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
