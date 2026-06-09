"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCandidateNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  appealUuid: z.string().optional(),
});

export const getCandidateNotificationSchema = z.object({
  cnUuid: z.string().min(1, "Notification UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCandidateNotificationsInput = z.input<
  typeof listCandidateNotificationsSchema
>;

export type CandidateNotificationItem = {
  cn_uuid: string;
  type: number;
  message: string | null;
  is_new: boolean | null;
  appeal_uuid: string | null;
  created_at: string | null;
};

export type CandidateNotificationDetail = CandidateNotificationItem | null;

export type ListCandidateNotificationsResult = {
  notifications: CandidateNotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_notification row to the shared item shape. */
function toItem(
  row: PrismaCandidateNotificationRow,
): CandidateNotificationItem {
  return {
    cn_uuid: row.cn_uuid,
    type: row.type,
    message: row.message ?? null,
    is_new: row.is_new ?? null,
    appeal_uuid: row.appeal_uuid ?? null,
    created_at: row.created_at?.toISOString() ?? null,
  };
}

// Internal Prisma row type
type PrismaCandidateNotificationRow = {
  cn_uuid: string;
  type: number;
  message: string | null;
  is_new: boolean | null;
  appeal_uuid: string | null;
  created_at: Date | null;
};

// ---------------------------------------------------------------------------
// listCandidateNotifications
// ---------------------------------------------------------------------------

/**
 * List notifications for the current candidate with pagination.
 * Self-service — candidateId derived from session.
 * Requires `candidate.read.own` capability.
 *
 * Maps from Yii2 CandidateNotificationController::actionIndex().
 */
export async function listCandidateNotifications(
  params: ListCandidateNotificationsInput = {},
): Promise<ListCandidateNotificationsResult> {
  const session = await requireCapability("candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listCandidateNotificationsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { appealUuid, page, limit } = parsed.data;
  const where: Record<string, unknown> = { candidate_id: candidateId };

  if (appealUuid !== undefined) {
    where.appeal_uuid = appealUuid;
  }

  const [rows, total] = await Promise.all([
    prisma.candidate_notification.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidate_notification.count({ where: where as any }),
  ]);

  // Count unread
  const unreadCount = await prisma.candidate_notification.count({
    where: { candidate_id: candidateId, is_new: true } as any,
  });

  return {
    notifications: rows.map(toItem),
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getCandidateNotification
// ---------------------------------------------------------------------------

/**
 * Get a single notification for the current candidate by UUID.
 * Self-service — candidateId derived from session.
 * Requires `candidate.read.own` capability.
 *
 * Maps from Yii2 CandidateNotificationController::actionView().
 */
export async function getCandidateNotification(
  cnUuid: string,
): Promise<CandidateNotificationDetail> {
  const session = await requireCapability("candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getCandidateNotificationSchema.safeParse({ cnUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid notification UUID",
    );
  }

  const row = await prisma.candidate_notification.findFirst({
    where: {
      cn_uuid: parsed.data.cnUuid,
      candidate_id: candidateId,
    } as any,
  });

  if (!row) return null;
  return toItem(row as PrismaCandidateNotificationRow);
}

// ---------------------------------------------------------------------------
// markNotificationRead
// ---------------------------------------------------------------------------

/**
 * Mark a single notification as read.
 * Self-service — candidateId derived from session.
 * Requires `candidate.read.own` capability.
 *
 * Maps from Yii2 CandidateNotificationController::actionMarkRead.
 */
export async function markNotificationRead(
  notificationUuid: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireCapability("candidate.read.own");
    const candidateId = Number(session.id);

    const notification = await prisma.candidate_notification.findFirst({
      where: {
        cn_uuid: notificationUuid,
        candidate_id: candidateId,
      },
    });

    if (!notification) {
      return { success: false, error: "Notification not found." };
    }

    await prisma.candidate_notification.update({
      where: { cn_uuid: notificationUuid },
      data: { is_new: false },
    });

    revalidatePath("/candidate/notifications");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to mark notification as read.",
    };
  }
}
