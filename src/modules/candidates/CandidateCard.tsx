import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

/**
 * Data shape for a compact candidate card shown in queue/grid views.
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
};

export type CandidateCardRole = "staff" | "admin" | "company";

export type CandidateCardProps = {
  data: CandidateCardData;
  href: string;
  isSelected?: boolean;
  role?: CandidateCardRole;
  variant?: "queue";
};

/**
 * Shared CandidateCard — a compact grid card for candidate directory views.
 *
 * Supports role-scoping:
 * - `staff`/`admin` — all fields visible (rate, email, status)
 * - `company` — hides rate and email (sensitive data)
 */
export function CandidateCard({
  data,
  href,
  isSelected = false,
  role = "staff",
}: CandidateCardProps) {
  const showSensitive = role === "staff" || role === "admin";

  return (
    <Link
      className={cn(
        "grid gap-[7px] border border-[#e2e6ee] rounded-lg bg-white text-[var(--ink)] p-2.5 no-underline",
        "hover:border-[#9dbde8] hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]",
        isSelected &&
          "shadow-[inset_3px_0_0_var(--blue),0_8px_24px_rgba(16,24,40,0.08)] border-[#9dbde8]",
      )}
      href={href as Route}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{data.signal}</span>
        <em className="not-italic text-xs text-[var(--muted)] truncate min-w-0">
          {data.status}
        </em>
      </div>

      <strong className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {data.name}
      </strong>

      {showSensitive && (
        <small className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[var(--muted)]">
          {data.email}
        </small>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[var(--muted)]">
          {data.company}
        </span>
        <span className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[var(--muted)]">
          {data.store}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <em className="not-italic text-xs text-[var(--muted)] truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {data.updated}
        </em>
        {showSensitive && (
          <strong className="truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            {data.rate}
          </strong>
        )}
      </div>

      {data.flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.flags.slice(0, 3).map((flag) => (
            <span
              key={flag}
              className="min-h-6 inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-[var(--muted)]"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
