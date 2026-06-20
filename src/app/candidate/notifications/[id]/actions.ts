"use server";

// ---------------------------------------------------------------------------
// Candidate Notifications [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to the parent list-level actions.
//
// Actions:
//   - getNotification      — fetch single notification detail by UUID
//   - markAsRead           — mark a notification as read
//   - deleteNotification   — remove a notification
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateNotificationDetail as parentGetNotificationDetail,
  updateNotification as parentUpdateNotification,
  dismissNotification as parentDismissNotification,
} from "../actions";
import type { NotificationDetail } from "../actions";

import {
  getNotificationSchema,
  markAsReadSchema,
  deleteNotificationSchema,
} from "./schemas";
import type {
  ActionResponse,
  GetNotificationParams,
  MarkAsReadParams,
  DeleteNotificationParams,
} from "./schemas";
import { notificationDetailSchema, actionResponseSchema } from "../schemas";

// ---------------------------------------------------------------------------
// getNotification
// ---------------------------------------------------------------------------

/**
 * Get a single notification with full detail for the current candidate.
 * Delegates to the parent `getCandidateNotificationDetail` action.
 */
export async function getNotification(
  notificationUuid: string,
): Promise<NotificationDetail | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getNotificationSchema.safeParse({ notificationUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid notification UUID");
  }

  const result = await parentGetNotificationDetail(Number(session.id), parsed.data.notificationUuid);

  const outputParsed = notificationDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[candidate/notifications/id] getNotification output validation failed:", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// markAsRead
// ---------------------------------------------------------------------------

/**
 * Mark a specific notification as read for the current candidate.
 * Delegates to the parent `updateNotification` with isNew=false.
 *
 * Returns `{ success: true }` on success, `{ success: false, error }` on failure.
 */
export async function markAsRead(
  notificationUuid: string,
): Promise<ActionResponse> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = markAsReadSchema.safeParse({ notificationUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid notification UUID",
    };
  }

  const result = await parentUpdateNotification(parsed.data.notificationUuid, { isNew: false });

  const outputParsed = actionResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[candidate/notifications/id] markAsRead output validation failed:", outputParsed.error.issues);
  }

  if (result.success) {
    revalidatePath("/candidate/notifications");
    revalidatePath(`/candidate/notifications/${parsed.data.notificationUuid}`);
    return { success: true };
  }

  return { success: false, error: result.error ?? "Failed to mark notification as read" };
}

// ---------------------------------------------------------------------------
// deleteNotification
// ---------------------------------------------------------------------------

/**
 * Delete a notification by UUID.
 * Only the owning candidate can delete their own notifications.
 * Delegates to the parent `dismissNotification`.
 *
 * Returns `{ success: true }` on success, `{ success: false, error }` on error.
 */
export async function deleteNotification(
  notificationUuid: string,
): Promise<ActionResponse> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = deleteNotificationSchema.safeParse({ notificationUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid notification UUID",
    };
  }

  const result = await parentDismissNotification(parsed.data.notificationUuid);

  const outputParsed = actionResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[candidate/notifications/id] deleteNotification output validation failed:", outputParsed.error.issues);
  }

  if (result.success) {
    revalidatePath("/candidate/notifications");
    return { success: true };
  }

  return { success: false as const, error: result.error ?? "Failed to delete notification" };
}
