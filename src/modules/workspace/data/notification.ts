import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";
import { getNotificationTypeLabel } from "@/modules/notifications/utils";

// ---------------------------------------------------------------------------
// Candidate Notification Rows
// ---------------------------------------------------------------------------

export type NotificationRow = {
  id: string;
  type: string;
  typeCode: number;
  message: string;
  isNew: string;
  created: string;
};

export async function getCandidateNotificationRows(candidateId: number): Promise<NotificationRow[]> {
  const rows = await prisma.candidate_notification.findMany({
    where: { candidate_id: candidateId },
    orderBy: { created_at: "desc" },
    take: 80,
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

// ---------------------------------------------------------------------------
// Candidate Notification Detail
// ---------------------------------------------------------------------------

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

export async function getCandidateNotificationDetail(
  candidateId: number,
  notificationUuid: string,
): Promise<NotificationDetail> {
  const notification = await prisma.candidate_notification.findFirst({
    where: { cn_uuid: notificationUuid, candidate_id: candidateId },
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
