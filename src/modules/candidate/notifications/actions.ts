"use server";

// ---------------------------------------------------------------------------
// Candidate Notifications — server actions for /candidate/notifications
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/notifications for listing,
// reading, dismissing, and updating notifications for the current candidate.
// ---------------------------------------------------------------------------

import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateNotificationRows as moduleGetNotificationRows,
  getCandidateNotificationDetail as moduleGetNotificationDetail,
  dismissNotification as moduleDismissNotification,
  updateNotification as moduleUpdateNotification,
} from "@/modules/notifications/actions";
import {
  notificationRowArraySchema,
  notificationDetailSchema,
  dismissResultSchema,
  updateResultSchema,
  type NotificationRow,
  type NotificationDetail,
} from "./schemas";

// Re-export types for client components
export type { NotificationRow, NotificationDetail };

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List notification rows for the current candidate (paginated).
 * Self-service — candidateId derived from session.
 * Requires `candidate.read.own` capability.
 */
export async function getCandidateNotificationRows(
  candidateId?: number,
  params?: { limit?: number },
): Promise<NotificationRow[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const cid = candidateId ?? Number(session.id);

  const result = await moduleGetNotificationRows(cid, params);

  const parsed = notificationRowArraySchema.safeParse(result);
  if (!parsed.success) {
    console.error("[candidate/notifications] getCandidateNotificationRows output validation failed:", parsed.error.issues);
  }

  return result;
}

/**
 * Get a single notification detail for the current candidate by UUID.
 * Self-service — candidateId derived from session.
 * Requires `candidate.read.own` capability.
 */
export async function getCandidateNotificationDetail(
  candidateId: number,
  notificationUuid: string,
): Promise<NotificationDetail> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const cid = candidateId ?? Number(session.id);

  const result = await moduleGetNotificationDetail(cid, notificationUuid);

  const parsed = notificationDetailSchema.safeParse(result);
  if (!parsed.success) {
    console.error("[candidate/notifications] getCandidateNotificationDetail output validation failed:", parsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// dismissNotification
// ---------------------------------------------------------------------------

/**
 * Dismiss (delete) a notification for the current candidate by UUID.
 * Delegates to modules/notifications for ownership verification.
 */
export async function dismissNotification(
  notificationUuid: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireRoleCapability("candidate", "candidate.read.own");
    const candidateId = Number(session.id);

    const result = await moduleDismissNotification(candidateId, notificationUuid);

    const parsed = dismissResultSchema.safeParse(result);
    if (!parsed.success) {
      console.error("[candidate/notifications] dismissNotification output validation failed:", parsed.error.issues);
    }

    return result;
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
 * Update (mark as read/unread) a notification for the current candidate.
 * Delegates to modules/notifications for ownership verification.
 */
export async function updateNotification(
  notificationUuid: string,
  data?: { isNew?: boolean },
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireRoleCapability("candidate", "candidate.read.own");
    const candidateId = Number(session.id);

    const result = await moduleUpdateNotification(candidateId, notificationUuid, data);

    const parsed = updateResultSchema.safeParse(result);
    if (!parsed.success) {
      console.error("[candidate/notifications] updateNotification output validation failed:", parsed.error.issues);
    }

    return result;
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
