"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCandidateNotificationsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  appealUuid: z.string().optional(),
});

const markNotificationReadSchema = z.object({
  cn_uuid: z.string().min(1, "Notification UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CandidateNotificationItem = {
  cn_uuid: string;
  type: number;
  message: string | null;
  is_new: boolean | null;
  appeal_uuid: string | null;
  created_at: string | null;
};

export type ListCandidateNotificationsResult = {
  notifications: CandidateNotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MarkNotificationReadResult = {
  operation: "success" | "error";
  message?: string;
};

export type MarkAllNotificationsReadResult = {
  operation: "success";
  affected: number;
};

// ---------------------------------------------------------------------------
// List notifications for the current candidate
// Mirrors legacy CandidateNotificationController::actionList()
// ---------------------------------------------------------------------------

export async function listCandidateNotifications(
  params: z.input<typeof listCandidateNotificationsSchema> = {},
): Promise<ListCandidateNotificationsResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listCandidateNotificationsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, appealUuid } = parsed.data;

  const where: Record<string, unknown> = { candidate_id: candidateId };
  if (appealUuid) {
    where.appeal_uuid = appealUuid;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.candidate_notification.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        cn_uuid: true,
        type: true,
        message: true,
        is_new: true,
        appeal_uuid: true,
        created_at: true,
      },
    }),
    prisma.candidate_notification.count({ where: where as any }),
    prisma.candidate_notification.count({
      where: { candidate_id: candidateId, is_new: true } as any,
    }),
  ]);

  // Format dates to ISO strings for serialization
  const formatted = notifications.map((n) => ({
    ...n,
    created_at: n.created_at?.toISOString() ?? null,
  }));

  return {
    notifications: formatted as CandidateNotificationItem[],
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// Mark a single notification as read
// Mirrors legacy CandidateNotificationController::actionMarkRead()
// ---------------------------------------------------------------------------

export async function markNotificationRead(
  params: z.input<typeof markNotificationReadSchema>,
): Promise<MarkNotificationReadResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = markNotificationReadSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid notification UUID",
    };
  }

  const { cn_uuid } = parsed.data;

  try {
    const result = await prisma.candidate_notification.updateMany({
      where: {
        cn_uuid,
        candidate_id: candidateId,
      },
      data: { is_new: false },
    });

    if (result.count === 0) {
      return {
        operation: "error",
        message: "Notification not found or already read",
      };
    }

    return { operation: "success" };
  } catch {
    return {
      operation: "error",
      message: "Failed to mark notification as read",
    };
  }
}

// ---------------------------------------------------------------------------
// Mark all notifications as read for the current candidate
// Mirrors legacy CandidateNotificationController::actionMarkReadAll()
// ---------------------------------------------------------------------------

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const result = await prisma.candidate_notification.updateMany({
    where: {
      candidate_id: candidateId,
      is_new: true,
    },
    data: { is_new: false },
  });

  return {
    operation: "success",
    affected: result.count,
  };
}
