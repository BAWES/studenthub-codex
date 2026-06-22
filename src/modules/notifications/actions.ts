"use server";

// ---------------------------------------------------------------------------
// Module-level actions for candidate notifications
// ---------------------------------------------------------------------------
// Contains the real Prisma logic for listing, reading, dismissing, and
// updating candidate notifications. App router actions delegate to this.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { getNotificationTypeLabel } from "./utils";
import { z } from "zod";
import {
  getCandidateNotificationRowsSchema,
  getCandidateNotificationDetailSchema,
  dismissNotificationSchema,
  updateNotificationSchema,
  notificationRowSchema,
  notificationDetailSchema,
  notificationActionResultSchema,
} from "./schemas";

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
 * List notification rows for a candidate (paginated).
 * Mirrors the legacy workspace/data.ts getCandidateNotificationRows.
 */
export async function getCandidateNotificationRows(
  candidateId: number,
  params?: { limit?: number },
): Promise<NotificationRow[]> {
  const parsed = getCandidateNotificationRowsSchema.safeParse(params ?? {});
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const rows = await prisma.candidate_notification.findMany({
    where: { candidate_id: candidateId },
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

  const result = rows.map((row) => ({
    id: row.cn_uuid,
    type: getNotificationTypeLabel(row.type),
    typeCode: row.type,
    message: row.message?.slice(0, 200) ?? "",
    isNew: row.is_new ? "Unread" : "Read",
    created: formatDate(row.created_at),
  }));

  const outputParsed = z.array(notificationRowSchema).safeParse(result);
  if (!outputParsed.success) {
    throw new Error(
      `Output validation failed for notification rows: ${outputParsed.error.message}`,
    );
  }
  return outputParsed.data;
}

/**
 * Get a single notification detail by UUID for the given candidate.
 */
export async function getCandidateNotificationDetail(
  candidateId: number,
  notificationUuid: string,
): Promise<NotificationDetail> {
  const parsed = getCandidateNotificationDetailSchema.safeParse({ notificationUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const notification = await prisma.candidate_notification.findFirst({
    where: { cn_uuid: parsed.data.notificationUuid, candidate_id: candidateId },
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

  const result = {
    notification,
    typeLabel: notification ? getNotificationTypeLabel(notification.type) : "",
  };

  const outputParsed = notificationDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    throw new Error(
      `Output validation failed for notification detail: ${outputParsed.error.message}`,
    );
  }
  return outputParsed.data;
}

/**
 * Dismiss (delete) a notification for a candidate by UUID.
 * Verifies ownership before deletion.
 */
export async function dismissNotification(
  candidateId: number,
  notificationUuid: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = dismissNotificationSchema.safeParse({ notificationUuid });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid notification UUID",
      };
    }

    // Verify ownership before deletion
    const notification = await prisma.candidate_notification.findFirst({
      where: {
        cn_uuid: parsed.data.notificationUuid,
        candidate_id: candidateId,
      },
    });

    if (!notification) {
      return { success: false, error: "Notification not found." };
    }

    await prisma.candidate_notification.delete({
      where: { cn_uuid: parsed.data.notificationUuid },
    });

    const outputParsed = notificationActionResultSchema.safeParse({ success: true });
    if (!outputParsed.success) {
      throw new Error(
        `Output validation failed for dismissNotification: ${outputParsed.error.message}`,
      );
    }
    return outputParsed.data;
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to dismiss notification.",
    };
  }
}

/**
 * Update (mark as read/unread) a notification for a candidate.
 * Verifies ownership before updating.
 */
export async function updateNotification(
  candidateId: number,
  notificationUuid: string,
  data?: { isNew?: boolean },
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = updateNotificationSchema.safeParse({
      notificationUuid,
      isNew: data?.isNew,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid params",
      };
    }

    // Verify ownership before updating
    const notification = await prisma.candidate_notification.findFirst({
      where: {
        cn_uuid: parsed.data.notificationUuid,
        candidate_id: candidateId,
      },
    });

    if (!notification) {
      return { success: false, error: "Notification not found." };
    }

    await prisma.candidate_notification.update({
      where: { cn_uuid: parsed.data.notificationUuid },
      data: {
        ...(parsed.data.isNew !== undefined ? { is_new: parsed.data.isNew } : {}),
      },
    });

    const outputParsed = notificationActionResultSchema.safeParse({ success: true });
    if (!outputParsed.success) {
      throw new Error(
        `Output validation failed for updateNotification: ${outputParsed.error.message}`,
      );
    }
    return outputParsed.data;
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to update notification.",
    };
  }
}
