// ---------------------------------------------------------------------------
// Notification type labels (mirrored from Yii2 CandidateNotification)
// Shared between actions.ts and other modules. NOT a server action file.
// ---------------------------------------------------------------------------

export const NOTIFICATION_TYPE_LABELS: Record<number, string> = {
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
