"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateNotificationsSchema,
  getCandidateNotificationSchema,
  createNotificationSchema,
  listCandidateNotificationsResultSchema,
  candidateNotificationItemSchema,
  createNotificationResultSchema,
  markNotificationReadResultSchema,
  type ListCandidateNotificationsInput,
  type CandidateNotificationItem,
  type CandidateNotificationDetail,
  type ListCandidateNotificationsResult,
  type CreateNotificationInput,
  type CreateNotificationResult,
} from "./schemas";

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

  const result = {
    notifications: rows.map(toItem),
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listCandidateNotificationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-notifications] listCandidateNotifications output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  if (!row) {
    const outputParsed = candidateNotificationItemSchema.safeParse(null);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidate-notifications] getCandidateNotification output validation failed:",
        outputParsed.error.issues,
      );
    }
    return null;
  }
  const item = toItem(row as PrismaCandidateNotificationRow);

  const outputParsed = candidateNotificationItemSchema.safeParse(item);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-notifications] getCandidateNotification output validation failed:",
      outputParsed.error.issues,
    );
  }

  return item;
}

// ---------------------------------------------------------------------------
// createNotification
// ---------------------------------------------------------------------------

/**
 * Create a new notification for a candidate.
 *
 * This is an admin/staff action — requires `admin.write` capability.
 * Generates a UUID, sets is_new=true, and persists to the database.
 */
export async function createNotification(
  params: CreateNotificationInput,
): Promise<CreateNotificationResult> {
  try {
    await requireCapability("admin.write");

    const parsed = createNotificationSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid notification data.",
      };
    }

    const { candidateId, type, message } = parsed.data;
    const now = new Date();
    const uuid = `notif_${crypto.randomUUID()}`;

    // Verify candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: { candidate_id: true },
    });

    if (!candidate) {
      return { success: false, error: "Candidate not found." };
    }

    await prisma.candidate_notification.create({
      data: {
        cn_uuid: uuid,
        candidate_id: candidateId,
        type,
        message,
        is_new: true,
        created_at: now,
        updated_at: now,
      },
    });

    revalidatePath("/candidate/notifications");
    const result: CreateNotificationResult = {
      success: true,
      notificationUuid: uuid,
    };

    const outputParsed = createNotificationResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidate-notifications] createNotification output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (e) {
    const result: CreateNotificationResult = {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to create notification.",
    };

    const outputParsed = createNotificationResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidate-notifications] createNotification output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }
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
      const result = { success: false as const, error: "Notification not found." };

      const outputParsed = markNotificationReadResultSchema.safeParse(result);
      if (!outputParsed.success) {
        console.error(
          "[modules/candidate-notifications] markNotificationRead output validation failed:",
          outputParsed.error.issues,
        );
      }

      return result;
    }

    await prisma.candidate_notification.update({
      where: { cn_uuid: notificationUuid },
      data: { is_new: false },
    });

    revalidatePath("/candidate/notifications");
    const result = { success: true as const };

    const outputParsed = markNotificationReadResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidate-notifications] markNotificationRead output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (e) {
    const result = {
      success: false as const,
      error:
        e instanceof Error
          ? e.message
          : "Failed to mark notification as read.",
    };

    const outputParsed = markNotificationReadResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidate-notifications] markNotificationRead output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}
