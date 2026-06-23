import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Data shape for a candidate card shown in queue/grid/console views.
 * Shared across staff, company, and admin role views.
 */
export type CandidateCardData = {
  id: number;
  uid?: string;
  name: string;
  email: string;
  company: string;
  store: string;
  status: string;
  signal: string;
  rate: string;
  updated: string;
  flags: string[];
  /** Admin‑only: civil ID verification status (e.g. "Verified", "Pending") */
  civilIdStatus?: string;
  /** Admin‑only: salary breakdown string (e.g. "3.500 KD/hr + 0.250 KD margin") */
  salaryBreakdown?: string;
  /** Staff/admin: phone number */
  phone?: string;
};

export type CandidateCardRole = "staff" | "admin" | "company";

export type CandidateCardProps = {
  data: CandidateCardData;
  href: string;

  /** Alias for `selected` — kept for backward compatibility. */
  isSelected?: boolean;

  /** When true the card is visually marked as picked. */
  selected?: boolean;

  /** Role context that determines which fields are visible. */
  role?: CandidateCardRole;

  /**
   * Override auto‑detected sensitive‑data visibility.
   * Default behaviour: staff+admin see rate & email, company does not.
   * Admin additionally sees civilIdStatus, salaryBreakdown, and phone.
   * Pass `true` to force visibility regardless of role.
   */
  showSensitiveData?: boolean;

  /**
   * Visual variant.
   * - `"compact"` — minimal grid card (name, signal, status, company).
   *   Suitable for dense queue views.
   * - `"detailed"` — full card with all role‑appropriate fields plus
   *   civil‑ID status and salary breakdown for admin.
   *   Suitable for modal previews or detail panels.
   * - Default (omitted) — current standard layout.
   */
  variant?: "compact" | "detailed";

  /** When provided the card gains a selection affordance (checkbox‑like). */
  onSelect?: (id: number) => void;

  /** Key for selection state tracking. Defaults to `data.id`. */
  key?: string | number;
};

/**
 * Shared CandidateCard — a compact grid card for candidate directory views.
 *
 * Supports role‑scoping, layout variants, and selection callbacks.
 */
export function CandidateCard({
  data,
  href,
  isSelected = false,
  selected,
  role = "staff",
  showSensitiveData,
  variant,
  onSelect,
}: CandidateCardProps) {
  const isSelectedEffective = selected ?? isSelected;

  // ---- visibility rules ----
  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const canViewSensitive =
    showSensitiveData ?? (role === "staff" || role === "admin");

  const canViewPhone = isAdmin || isStaff;
  const canViewCivilId = isAdmin;
  const canViewSalaryBreakdown = isAdmin;

  // ---- indicator icon ----
  const getStatusIcon = (): string | null => {
    // Use the existing `signal` field, or derive from status
    if (data.signal) return data.signal;
    return null;
  };

  // ---- compact variant ----
  if (variant === "compact") {
    return (
      <Link
        className={cn(
          "grid gap-1.5 border border-border rounded-lg bg-card text-foreground p-2.5 no-underline",
          "hover:border-blue hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]",
          isSelectedEffective &&
            "shadow-[inset_3px_0_0_var(--blue),0_8px_24px_rgba(16,24,40,0.08)] border-blue",
          onSelect && "cursor-pointer",
        )}
        href={onSelect ? "#" : (href as Route)}
        onClick={
          onSelect
            ? (e) => {
                e.preventDefault();
                onSelect(data.id);
              }
            : undefined
        }
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate min-w-0">
            {data.name}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {getStatusIcon() ?? data.status}
          </span>
        </div>
        <span className="text-xs text-muted-foreground truncate">
          {data.company}
        </span>
      </Link>
    );
  }

  // ---- detailed variant ----
  if (variant === "detailed") {
    return (
      <Link
        className={cn(
          "grid gap-2 border border-border rounded-lg bg-card text-foreground p-4 no-underline",
          "hover:border-blue hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]",
          isSelectedEffective &&
            "shadow-[inset_3px_0_0_var(--blue),0_8px_24px_rgba(16,24,40,0.08)] border-blue",
        )}
        href={href as Route}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {onSelect && (
              <button
                type="button"
                className={cn(
                  "w-4 h-4 rounded border shrink-0 flex items-center justify-center text-[10px]",
                  isSelectedEffective
                    ? "bg-blue border-blue text-white"
                    : "border-border bg-background",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(data.id);
                }}
              >
                {isSelectedEffective ? "✓" : ""}
              </button>
            )}
            <span className="text-lg leading-tight">{getStatusIcon()}</span>
            <span className="text-xs text-muted-foreground">{data.status}</span>
          </div>
          {canViewSensitive && (
            <strong className="text-sm truncate min-w-0">{data.rate}</strong>
          )}
        </div>

        {/* Name + phone */}
        <div className="flex items-center justify-between gap-2">
          <strong className="text-base truncate">{data.name}</strong>
          {canViewPhone && data.phone && (
            <span className="text-xs text-muted-foreground shrink-0">
              {data.phone}
            </span>
          )}
        </div>

        {/* Email */}
        {canViewSensitive && (
          <small className="truncate text-xs text-muted-foreground">
            {data.email}
          </small>
        )}

        {/* Company + store */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{data.company}</span>
          <span className="truncate">{data.store}</span>
        </div>

        {/* Admin-only: civil ID + salary breakdown */}
        {canViewCivilId && (data.civilIdStatus || data.salaryBreakdown) && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border text-xs">
            {data.civilIdStatus && (
              <div>
                <span className="text-muted-foreground">Civil ID: </span>
                <span
                  className={cn(
                    "font-medium",
                    data.civilIdStatus === "Verified" &&
                      "text-green-600",
                    data.civilIdStatus === "Pending" &&
                      "text-amber-600",
                    data.civilIdStatus === "Rejected" &&
                      "text-red-600",
                  )}
                >
                  {data.civilIdStatus}
                </span>
              </div>
            )}
            {data.salaryBreakdown && (
              <div className="text-right">
                <span className="text-muted-foreground">Salary: </span>
                <span className="font-medium">{data.salaryBreakdown}</span>
              </div>
            )}
          </div>
        )}

        {/* Flags */}
        {data.flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.flags.slice(0, 3).map((flag) => (
              <Badge key={flag} variant="outline" className="text-xs">
                {flag}
              </Badge>
            ))}
          </div>
        )}

        {/* Updated */}
        <span className="text-xs text-muted-foreground">{data.updated}</span>
      </Link>
    );
  }

  // ---- default (standard) variant ----
  return (
    <Link
      className={cn(
        "grid gap-[7px] border border-border rounded-lg bg-card text-foreground p-2.5 no-underline",
        "hover:border-blue hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]",
        isSelectedEffective &&
          "shadow-[inset_3px_0_0_var(--blue),0_8px_24px_rgba(16,24,40,0.08)] border-blue",
      )}
      href={href as Route}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{data.signal}</span>
        <em className="not-italic text-xs text-muted-foreground truncate min-w-0">
          {data.status}
        </em>
      </div>

      <strong className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {data.name}
      </strong>

      {canViewSensitive && (
        <small className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
          {data.email}
        </small>
      )}

      {/* Phone (staff/admin only) */}
      {canViewSensitive && data.phone && (
        <small className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
          {data.phone}
        </small>
      )}

      {/* Civil ID status (admin only) */}
      {canViewCivilId && data.civilIdStatus && (
        <small className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs">
          <span className="text-muted-foreground">Civil ID: </span>
          <span
            className={cn(
              "font-medium",
              data.civilIdStatus === "Verified" && "text-green-600",
              data.civilIdStatus === "Pending" && "text-amber-600",
              data.civilIdStatus === "Rejected" && "text-red-600",
            )}
          >
            {data.civilIdStatus}
          </span>
        </small>
      )}

      {/* Salary breakdown (admin only) */}
      {canViewSalaryBreakdown && data.salaryBreakdown && (
        <small className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs">
          <span className="text-muted-foreground">Salary: </span>
          <span className="font-medium">{data.salaryBreakdown}</span>
        </small>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
          {data.company}
        </span>
        <span className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
          {data.store}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <em className="not-italic text-xs text-muted-foreground truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {data.updated}
        </em>
        {canViewSensitive && (
          <strong className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            {data.rate}
          </strong>
        )}
      </div>

      {data.flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.flags.slice(0, 3).map((flag) => (
            <Badge key={flag} variant="outline" className="text-xs">
              {flag}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
