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
import type {
  NotificationRow,
  NotificationDetail,
} from "@/modules/notifications/actions";

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

  return moduleGetNotificationRows(cid, params);
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

  return moduleGetNotificationDetail(cid, notificationUuid);
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

    return moduleDismissNotification(candidateId, notificationUuid);
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

// ---------------------------------------------------------------------------
// updateNotification
// ---------------------------------------------------------------------------

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

    return moduleUpdateNotification(candidateId, notificationUuid, data);
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
