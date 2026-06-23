import type { StatusBadgeVariant } from "./StatusBadge";

// ---------------------------------------------------------------------------
// Status → StatusBadge variant mapping
// ---------------------------------------------------------------------------

/**
 * Map a company approval status to its StatusBadge variant.
 * Values: "Approved" | "Not approved"
 */
export function companyStatusVariant(status: string): StatusBadgeVariant {
  switch (status) {
    case "Approved":
      return "success";
    case "Not approved":
      return "warning";
    default:
      return "neutral";
  }
}

/**
 * Map a request pipeline status to its StatusBadge variant.
 * Values seen in DB: "started", "delivered", "cancelled", "finished_by_recruitment"
 */
export function requestStatusVariant(status: string): StatusBadgeVariant {
  switch (status) {
    case "started":
      return "info";
    case "delivered":
      return "success";
    case "finished_by_recruitment":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "neutral";
  }
}

/**
 * Map a candidate status label to its StatusBadge variant.
 * Values: "Active", "Needs review", "Status N" (fallback)
 */
export function candidateStatusVariant(status: string): StatusBadgeVariant {
  switch (status) {
    case "Active":
      return "success";
    case "Needs review":
      return "warning";
    default:
      return "neutral";
  }
}

/**
 * Map a transfer status code (numeric) to both a StatusBadge variant and a
 * human-readable label.
 *
 * Transfer status codes seen in DB: 0, 1, 3, 4, 5, 10
 *
 * Returns { variant, label } ready to pass to <StatusBadge>.
 */
export interface TransferStatusMapping {
  variant: StatusBadgeVariant;
  label: string;
}

export function transferStatusMapping(code: number): TransferStatusMapping {
  switch (code) {
    case 0:
      return { variant: "neutral", label: "Draft" };
    case 1:
      return { variant: "info", label: "Pending" };
    case 3:
      return { variant: "warning", label: "Processing" };
    case 4:
      return { variant: "success", label: "Completed" };
    case 5:
      return { variant: "error", label: "Cancelled" };
    case 10:
      return { variant: "success", label: "Settled" };
    default:
      return { variant: "neutral", label: `Status ${code}` };
  }
}

// ---------------------------------------------------------------------------
// Reusable variant-by-label map (for generic / dynamic status values)
// ---------------------------------------------------------------------------

/**
 * Catch-all map for arbitrary status labels to StatusBadge variants.
 * Handles common English status keywords found across the application.
 */
export function genericStatusVariant(status: string): StatusBadgeVariant {
  const lower = status.toLowerCase();

  if (lower.includes("approve") || lower.includes("active") || lower.includes("deliver") || lower.includes("complete") || lower.includes("settle") || lower.includes("finish") || lower.includes("success") || lower.includes("paid") || lower.includes("done")) {
    return "success";
  }

  if (lower.includes("cancel") || lower.includes("fail") || lower.includes("error") || lower.includes("reject") || lower.includes("denied") || lower.includes("blocked") || lower.includes("issue") || lower.includes("problem")) {
    return "error";
  }

  if (lower.includes("pend") || lower.includes("wait") || lower.includes("progress") || lower.includes("start") || lower.includes("processing") || lower.includes("review") || lower.includes("hold") || lower.includes("schedul") || lower.includes("submit")) {
    return "info";
  }

  if (lower.includes("draft") || lower.includes("not approve") || lower.includes("inactive") || lower.includes("incomplete")) {
    return "warning";
  }

  return "neutral";
}
