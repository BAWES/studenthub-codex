// ---------------------------------------------------------------------------
// Centralized status-to-label and status-to-badge-variant mappings.
// Pure utility — safe to import in both Server and Client Components.
// ---------------------------------------------------------------------------

import type { StatusBadgeVariant } from "@/modules/workspace/StatusBadge";

// ===========================================================================
// 1. Invitation status — numeric codes (invitation table)
// ===========================================================================

export const INVITATION_STATUS_INVITED  = 0;
export const INVITATION_STATUS_ACCEPTED = 1;
export const INVITATION_STATUS_REJECTED = 2;

export const INVITATION_STATUS_LABELS: Record<number, string> = {
  [INVITATION_STATUS_INVITED]:  "Invited",
  [INVITATION_STATUS_ACCEPTED]: "Accepted",
  [INVITATION_STATUS_REJECTED]: "Rejected",
};

export const INVITATION_STATUS_VARIANTS: Record<number, StatusBadgeVariant> = {
  [INVITATION_STATUS_INVITED]:  "info",
  [INVITATION_STATUS_ACCEPTED]: "success",
  [INVITATION_STATUS_REJECTED]: "error",
};

/** Map an invitation numeric status code to its human-readable label. */
export function invitationStatusLabel(status: number | null | undefined): string {
  return status != null
    ? (INVITATION_STATUS_LABELS[status] ?? `Status ${status}`)
    : "Unknown";
}

/** Map an invitation numeric status code to its StatusBadge variant colour. */
export function invitationStatusVariant(status: number | null | undefined): StatusBadgeVariant {
  return status != null
    ? (INVITATION_STATUS_VARIANTS[status] ?? "neutral")
    : "neutral";
}

// ===========================================================================
// 2. Application status — string values (job_listing_application table)
// ===========================================================================

export const APPLICATION_STATUSES = [
  "applied",
  "reviewing",
  "shortlisted",
  "interviewed",
  "accepted",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  applied:      "Applied",
  reviewing:    "Reviewing",
  shortlisted:  "Shortlisted",
  interviewed:  "Interviewed",
  accepted:     "Accepted",
  rejected:     "Rejected",
};

export const APPLICATION_STATUS_VARIANTS: Record<string, StatusBadgeVariant> = {
  applied:      "info",
  reviewing:    "warning",
  shortlisted:  "info",
  interviewed:  "info",
  accepted:     "success",
  rejected:     "error",
};

/** Map an application status string to its human-readable label. */
export function applicationStatusLabel(status: string | null | undefined): string {
  if (!status) return "Unknown";
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

/** Map an application status string to its StatusBadge variant colour. */
export function applicationStatusVariant(status: string | null | undefined): StatusBadgeVariant {
  if (!status) return "neutral";
  return APPLICATION_STATUS_VARIANTS[status] ?? "neutral";
}

// ===========================================================================
// 3. Work log status — numeric codes (candidate_working_hour table)
// ===========================================================================
// Status codes used in the legacy Yii2 system; stored as SmallInt.
//   0 = Pending / Submitted
//   1 = Approved
//   2 = Rejected (via appeal)
//   3+ = additional legacy codes (mapped generically)

export const WORK_LOG_STATUS_PENDING  = 0;
export const WORK_LOG_STATUS_APPROVED = 1;
export const WORK_LOG_STATUS_REJECTED = 2;

export const WORK_LOG_STATUS_LABELS: Record<number, string> = {
  [WORK_LOG_STATUS_PENDING]:  "Pending",
  [WORK_LOG_STATUS_APPROVED]: "Approved",
  [WORK_LOG_STATUS_REJECTED]: "Rejected",
};

export const WORK_LOG_STATUS_VARIANTS: Record<number, StatusBadgeVariant> = {
  [WORK_LOG_STATUS_PENDING]:  "info",
  [WORK_LOG_STATUS_APPROVED]: "success",
  [WORK_LOG_STATUS_REJECTED]: "error",
};

/** Map a work log numeric status code to its human-readable label. */
export function workLogStatusLabel(status: number | null | undefined): string {
  return status != null
    ? (WORK_LOG_STATUS_LABELS[status] ?? `Status ${status}`)
    : "Unknown";
}

/** Map a work log numeric status code to its StatusBadge variant colour. */
export function workLogStatusVariant(status: number | null | undefined): StatusBadgeVariant {
  return status != null
    ? (WORK_LOG_STATUS_VARIANTS[status] ?? "neutral")
    : "neutral";
}
