import type { StatusBadgeVariant } from "./StatusBadge";

// ---------------------------------------------------------------------------
// Candidate status mapping (admin + staff search)
// ---------------------------------------------------------------------------

export function mapCandidateStatus(
  approved: number | null | undefined,
  candidateStatus: number | null | undefined,
): {
  variant: StatusBadgeVariant;
  label: string;
} {
  if (approved === 0) return { variant: "warning", label: "Needs review" };
  if (candidateStatus === 10) return { variant: "success", label: "Active" };
  if (candidateStatus != null) return { variant: "neutral", label: `Status ${candidateStatus}` };
  return { variant: "neutral", label: "Unknown" };
}

// ---------------------------------------------------------------------------
// Request status mapping (admin + staff)
// ---------------------------------------------------------------------------

const requestStatusVariant: Record<string, StatusBadgeVariant> = {
  started: "info",
  delivered: "success",
  cancelled: "error",
  finished_by_recruitment: "info",
};

const requestStatusLabel: Record<string, string> = {
  started: "Started",
  delivered: "Delivered",
  cancelled: "Cancelled",
  finished_by_recruitment: "Finished by Recruitment",
};

export function mapRequestStatus(status: string | null | undefined): {
  variant: StatusBadgeVariant;
  label: string;
} {
  const raw = (status ?? "").toLowerCase();
  return {
    variant: requestStatusVariant[raw] ?? "neutral",
    label: requestStatusLabel[raw] ?? status ?? "No status",
  };
}

// ---------------------------------------------------------------------------
// Company commercial status mapping
// ---------------------------------------------------------------------------

export function mapCompanyStatus(approved: boolean): {
  variant: StatusBadgeVariant;
  label: string;
} {
  return approved
    ? { variant: "success", label: "Approved" }
    : { variant: "error", label: "Not approved" };
}

// ---------------------------------------------------------------------------
// Transfer status mapping (numeric codes)
// TODO: STU-1080 should consolidate this into a centralized lookup
// ---------------------------------------------------------------------------

const transferStatusMap: Record<number, { variant: StatusBadgeVariant; label: string }> = {
  0: { variant: "neutral", label: "Draft" },
  1: { variant: "warning", label: "Pending" },
  3: { variant: "info", label: "Processing" },
  4: { variant: "success", label: "Completed" },
  5: { variant: "error", label: "Cancelled" },
  10: { variant: "neutral", label: "Archived" },
};

export function mapTransferStatus(status: number | null | undefined): {
  variant: StatusBadgeVariant;
  label: string;
} {
  if (status == null) return { variant: "neutral", label: "No status" };
  return transferStatusMap[status] ?? { variant: "neutral", label: `Status ${status}` };
}
