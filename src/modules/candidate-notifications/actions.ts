"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

/**
 * Mark a single notification as read.
 * Mirrors Yii2 CandidateNotificationController::actionMarkRead.
 * Self-service — candidateId derived from session.
 */
export async function markNotificationRead(notificationUuid: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireCapability("candidate.read.own");
    const candidateId = Number(session.id);

    const notification = await prisma.candidate_notification.findFirst({
      where: { cn_uuid: notificationUuid, candidate_id: candidateId },
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
      error: e instanceof Error ? e.message : "Failed to mark notification as read.",
    };
  }
}
