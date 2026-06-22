"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  EmptyState — custom illustration + CTA per state                   */
/*  Each variant has a unique inline SVG illustration designed for the  */
/*  StudentHub OS aesthetic — playful, purposeful, never apologetic.    */
/*  Inspired by Linear"s empty states.                                  */
/* ------------------------------------------------------------------ */

export type EmptyStateVariant =
  | "search"      // No search results found
  | "empty"       // List/view has no items yet
  | "error"       // Something went wrong
  | "success"     // Action completed (e.g. form submitted)
  | "loading"     // Initial loading state (glass skeleton style)
  | "idle";       // Feature not yet started (default)

export interface EmptyStateProps {
  /** The state variant determines the illustration and tone */
  variant?: EmptyStateVariant;
  /** Primary heading (required) */
  title: string;
  /** Secondary description text */
  description?: string;
  /** Optional CTA button label */
  actionLabel?: string;
  /** Optional CTA click handler */
  onAction?: () => void;
  /** Optional CTA href (link instead of button) */
  actionHref?: string;
  /** Entrance delay for stagger (pass index * 80) */
  entranceDelay?: number;
  className?: string;
}

/* ── Illustration components ───────────────────────────────────── */

function SearchEmpty({ className }: { className?: string }) {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={cn("shEmptyStateSvg", className)}
      aria-hidden="true"
    >
      {/* Magnifying glass */}
      <circle cx="46" cy="40" r="22" stroke="var(--muted)" strokeWidth="2.5" opacity="0.5" />
      <line x1="62" y1="56" x2="80" y2="74" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* Dashed circle — searching motion */}
      <circle cx="46" cy="40" r="26" stroke="var(--sh-info)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
      {/* Small sparkle dots */}
      <circle cx="88" cy="28" r="3" fill="var(--sh-info)" opacity="0.3" />
      <circle cx="94" cy="44" r="2" fill="var(--sh-warning)" opacity="0.25" />
      <circle cx="78" cy="18" r="2" fill="var(--sh-success)" opacity="0.2" />
    </svg>
  );
}

function EmptyCanvas({ className }: { className?: string }) {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={cn("shEmptyStateSvg", className)}
      aria-hidden="true"
    >
      {/* Empty frame */}
      <rect x="15" y="18" width="90" height="64" rx="8" stroke="var(--muted)" strokeWidth="2" opacity="0.3" />
      {/* Plus icon in center */}
      <line x1="60" y1="36" x2="60" y2="64" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="46" y1="50" x2="74" y2="50" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* Sparkle */}
      <circle cx="85" cy="30" r="3" fill="var(--sh-info)" opacity="0.35" />
    </svg>
  );
}

function ErrorState({ className }: { className?: string }) {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={cn("shEmptyStateSvg", className)}
      aria-hidden="true"
    >
      {/* Alert circle */}
      <circle cx="60" cy="46" r="24" stroke="var(--sh-error)" strokeWidth="2.5" opacity="0.5" />
      {/* Exclamation */}
      <line x1="60" y1="36" x2="60" y2="50" stroke="var(--sh-error)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="60" cy="58" r="2" fill="var(--sh-error)" opacity="0.6" />
      {/* Dotted rings */}
      <circle cx="60" cy="46" r="30" stroke="var(--sh-error)" strokeWidth="1" strokeDasharray="3 5" opacity="0.2" />
    </svg>
  );
}

function SuccessState({ className }: { className?: string }) {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={cn("shEmptyStateSvg", className)}
      aria-hidden="true"
    >
      {/* Check circle */}
      <circle cx="60" cy="46" r="24" stroke="var(--sh-success)" strokeWidth="2.5" opacity="0.5" />
      {/* Checkmark */}
      <path d="M50 46l7 7 14-14" stroke="var(--sh-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {/* Glow ring */}
      <circle cx="60" cy="46" r="28" stroke="var(--sh-success)" strokeWidth="1" opacity="0.2" />
      {/* Sparkles */}
      <circle cx="78" cy="30" r="2.5" fill="var(--sh-success)" opacity="0.3" />
      <circle cx="42" cy="66" r="2" fill="var(--sh-success)" opacity="0.2" />
    </svg>
  );
}

function LoadingState({ className }: { className?: string }) {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={cn("shEmptyStateSvg", className)}
      aria-hidden="true"
    >
      {/* Pulsing circle */}
      <circle cx="60" cy="46" r="22" stroke="var(--sh-info)" strokeWidth="2" opacity="0.3" className="shPulseRing" />
      <circle cx="60" cy="46" r="16" stroke="var(--sh-info)" strokeWidth="2" strokeDasharray="6 6" opacity="0.5" />
      {/* Dashed orbital path */}
      <ellipse cx="60" cy="46" rx="34" ry="12" stroke="var(--sh-info)" strokeWidth="1" strokeDasharray="3 6" opacity="0.15" />
    </svg>
  );
}

function IdleState({ className }: { className?: string }) {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={cn("shEmptyStateSvg", className)}
      aria-hidden="true"
    >
      {/* Window frame */}
      <rect x="22" y="20" width="76" height="60" rx="8" stroke="var(--muted)" strokeWidth="2" opacity="0.25" />
      {/* Window title bar dots */}
      <circle cx="34" cy="32" r="3" fill="var(--sh-error)" opacity="0.2" />
      <circle cx="46" cy="32" r="3" fill="var(--sh-warning)" opacity="0.2" />
      <circle cx="58" cy="32" r="3" fill="var(--sh-success)" opacity="0.2" />
      {/* Content lines */}
      <line x1="34" y1="48" x2="80" y2="48" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />
      <line x1="34" y1="56" x2="70" y2="56" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.12" />
      <line x1="34" y1="64" x2="62" y2="64" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.1" />
    </svg>
  );
}

/* ── Variant map ──────────────────────────────────────────────── */

const illustrationMap: Record<EmptyStateVariant, React.ComponentType<{ className?: string }>> = {
  search: SearchEmpty,
  empty: EmptyCanvas,
  error: ErrorState,
  success: SuccessState,
  loading: LoadingState,
  idle: IdleState,
};

/* ── Component ────────────────────────────────────────────────── */

function EmptyState({
  variant = "idle",
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  entranceDelay = 0,
  className,
}: EmptyStateProps) {
  const Illustration = illustrationMap[variant];
  const delay = Math.min(entranceDelay, 600);

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "shEmptyState",
        className,
      )}
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
      role="status"
    >
      <div className="shEmptyStateIllustration">
        <Illustration />
      </div>
      <div className="shEmptyStateContent">
        <h3 className="shEmptyStateTitle">{title}</h3>
        {description && (
          <p className="shEmptyStateDesc">{description}</p>
        )}
      </div>
      {actionLabel && (onAction || actionHref) && (
        <div className="shEmptyStateAction">
          {actionHref ? (
            <a
              href={actionHref}
              className="uiButton uiButton_default uiButton_sm"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="uiButton uiButton_default uiButton_sm"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { EmptyState };
