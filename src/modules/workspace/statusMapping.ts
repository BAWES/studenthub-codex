import type { StatusBadgeVariant } from "./StatusBadge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StatusMapping = {
  variant: StatusBadgeVariant;
  label: string;
};

export type CandidateStatusKey = {
  approved: number | null | undefined;
  candidateStatus: number | null | undefined;
};

export type StatusDomain =
  | "candidate"
  | "request"
  | "company"
  | "transfer";

// ---------------------------------------------------------------------------
// Registry — single source of truth for all status mappings
// ---------------------------------------------------------------------------

const requestStatusVariantMap: Record<string, StatusBadgeVariant> = {
  started: "info",
  delivered: "success",
  cancelled: "error",
  finished_by_recruitment: "info",
};

const requestStatusLabelMap: Record<string, string> = {
  started: "Started",
  delivered: "Delivered",
  cancelled: "Cancelled",
  finished_by_recruitment: "Finished by Recruitment",
};

const transferStatusMap: Record<number, StatusMapping> = {
  0: { variant: "neutral", label: "Draft" },
  1: { variant: "warning", label: "Pending" },
  3: { variant: "info", label: "Processing" },
  4: { variant: "success", label: "Completed" },
  5: { variant: "error", label: "Cancelled" },
  10: { variant: "neutral", label: "Archived" },
};

const registry: Record<
  StatusDomain,
  (key: unknown) => StatusMapping
> = {
  candidate(key: unknown) {
    const { approved, candidateStatus } = key as CandidateStatusKey;
    if (approved === 0)
      return { variant: "warning", label: "Needs review" };
    if (candidateStatus === 10)
      return { variant: "success", label: "Active" };
    if (candidateStatus != null)
      return { variant: "neutral", label: `Status ${candidateStatus}` };
    return { variant: "neutral", label: "Unknown" };
  },
  request(key: unknown) {
    const raw = ((key as string | null | undefined) ?? "").toLowerCase();
    return {
      variant: requestStatusVariantMap[raw] ?? "neutral",
      label: requestStatusLabelMap[raw] ?? (raw || "No status"),
    };
  },
  company(key: unknown) {
    const approved = key as boolean;
    return approved
      ? { variant: "success", label: "Approved" }
      : { variant: "error", label: "Not approved" };
  },
  transfer(key: unknown) {
    const status = key as number | null | undefined;
    if (status == null) return { variant: "neutral", label: "No status" };
    return transferStatusMap[status] ?? {
      variant: "neutral",
      label: `Status ${status}`,
    };
  },
};

// ---------------------------------------------------------------------------
// Centralized lookup function
// ---------------------------------------------------------------------------

/**
 * Look up a status mapping by domain and key.
 *
 * @param domain - The status domain ("candidate", "request", "company", "transfer")
 * @param key - Domain-specific input:
 *   - candidate: `{ approved, candidateStatus }`
 *   - request: `string | null | undefined`
 *   - company: `boolean`
 *   - transfer: `number | null | undefined`
 */
export function lookupStatus(
  domain: StatusDomain,
  key: unknown,
): StatusMapping {
  return registry[domain](key);
}

// ---------------------------------------------------------------------------
// Legacy per-domain exports — kept for backward compatibility
// ---------------------------------------------------------------------------

export function mapCandidateStatus(
  approved: number | null | undefined,
  candidateStatus: number | null | undefined,
): StatusMapping {
  return lookupStatus("candidate", { approved, candidateStatus });
}

export function mapRequestStatus(
  status: string | null | undefined,
): StatusMapping {
  return lookupStatus("request", status);
}

export function mapCompanyStatus(approved: boolean): StatusMapping {
  return lookupStatus("company", approved);
}

export function mapTransferStatus(
  status: number | null | undefined,
): StatusMapping {
  return lookupStatus("transfer", status);
}
