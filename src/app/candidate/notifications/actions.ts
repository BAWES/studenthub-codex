"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getNotificationDetailSchema = z.object({
  cnUuid: z.string().min(1, "Notification UUID is required"),
});

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

/** Legend copied from Yii2 CandidateNotification model types. */
const NOTIFICATION_TYPE_LABELS: Record<number, string> = {
  0: "Invitation",
  1: "Assignment",
  2: "Unassigned",
  3: "Work Approved",
  4: "Work Rejected",
  5: "Transfer Initiated",
  6: "Transfer Paid",
  7: "Transfer Unpaid",
  8: "Work Session Approved",
  9: "Work Session Rejected",
  10: "Job Interest Shortlisted",
  11: "Job Interest Rejected",
};

function getNotificationTypeLabel(type: number): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? `Unknown (${type})`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationRow = {
  id: string;
  type: string;
  typeCode: number;
  message: string;
  isNew: string;
  created: string;
};

export type ListNotificationsResult = {
  items: NotificationRow[];
  total: number;
  page: number;
  limit: number;
};

export type NotificationDetail = {
  notification: {
    cn_uuid: string;
    type: number;
    message: string | null;
    is_new: boolean | null;
    created_at: Date | null;
    updated_at: Date | null;
    invitation_uuid: string | null;
    request_uuid: string | null;
    company_id: number | null;
    store_id: number | null;
    staff_id: number | null;
  } | null;
  typeLabel: string;
};

// ---------------------------------------------------------------------------
// listNotifications
// ---------------------------------------------------------------------------

/**
 * List notifications for the current candidate (paginated).
 * Replaces the legacy getCandidateNotificationRows from @/modules/workspace/data.
 */
export async function listNotifications(
  input: { page?: number; limit?: number } = {},
): Promise<ListNotificationsResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listNotificationsSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list params");
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where = { candidate_id: candidateId };

  const [rows, total] = await Promise.all([
    prisma.candidate_notification.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        cn_uuid: true,
        type: true,
        message: true,
        is_new: true,
        created_at: true,
      },
    }),
    prisma.candidate_notification.count({ where: where as any }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.cn_uuid,
      type: getNotificationTypeLabel(row.type),
      typeCode: row.type,
      message: row.message?.slice(0, 200) ?? "",
      isNew: row.is_new ? "Unread" : "Read",
      created: formatDate(row.created_at),
    })),
    total,
    page,
    limit,
  };
}

// ---------------------------------------------------------------------------
// getNotificationDetail
// ---------------------------------------------------------------------------

/**
 * Get a single notification by UUID for the current candidate.
 * Replaces the legacy getCandidateNotificationDetail from @/modules/workspace/data.
 */
export async function getNotificationDetail(
  cnUuid: string,
): Promise<NotificationDetail> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getNotificationDetailSchema.safeParse({ cnUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid notification UUID");
  }

  const notification = await prisma.candidate_notification.findFirst({
    where: {
      cn_uuid: parsed.data.cnUuid,
      candidate_id: candidateId,
    },
    select: {
      cn_uuid: true,
      type: true,
      message: true,
      is_new: true,
      created_at: true,
      updated_at: true,
      invitation_uuid: true,
      request_uuid: true,
      company_id: true,
      store_id: true,
      staff_id: true,
    },
  });

  return {
    notification,
    typeLabel: notification ? getNotificationTypeLabel(notification.type) : "",
  };
}
