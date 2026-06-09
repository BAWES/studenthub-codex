"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Notification type labels (mirrored from Yii2 CandidateNotification)
// ---------------------------------------------------------------------------

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

export function getNotificationTypeLabel(type: number): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? `Unknown (${type})`;
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getCandidateNotificationRowsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(80),
});

export const getCandidateNotificationDetailSchema = z.object({
  notificationUuid: z.string().min(1, "Notification UUID is required"),
});

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
// Server actions
// ---------------------------------------------------------------------------

/**
 * List notification rows for the current candidate (paginated).
 * Mirrors the legacy workspace/data.ts getCandidateNotificationRows.
 * Self-service — candidateId derived from session.
 * Requires `candidate.read.own` capability.
 */
export async function getCandidateNotificationRows(
  candidateId?: number,
  params?: z.input<typeof getCandidateNotificationRowsSchema>,
): Promise<NotificationRow[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const cid = candidateId ?? Number(session.id);

  const parsed = getCandidateNotificationRowsSchema.safeParse(params ?? {});
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const rows = await prisma.candidate_notification.findMany({
    where: { candidate_id: cid },
    orderBy: { created_at: "desc" },
    take: parsed.data.limit,
    select: {
      cn_uuid: true,
      type: true,
      message: true,
      is_new: true,
      created_at: true,
    },
  });

  return rows.map((row) => ({
    id: row.cn_uuid,
    type: getNotificationTypeLabel(row.type),
    typeCode: row.type,
    message: row.message?.slice(0, 200) ?? "",
    isNew: row.is_new ? "Unread" : "Read",
    created: formatDate(row.created_at),
  }));
}

/**
 * Get a single notification detail for the current candidate by UUID.
 * Mirrors the legacy workspace/data.ts getCandidateNotificationDetail.
 * Self-service — candidateId derived from session.
 * Requires `candidate.read.own` capability.
 */
export async function getCandidateNotificationDetail(
  candidateId: number,
  notificationUuid: string,
): Promise<NotificationDetail> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const cid = candidateId ?? Number(session.id);

  const parsed = getCandidateNotificationDetailSchema.safeParse({ notificationUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const notification = await prisma.candidate_notification.findFirst({
    where: { cn_uuid: parsed.data.notificationUuid, candidate_id: cid },
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
