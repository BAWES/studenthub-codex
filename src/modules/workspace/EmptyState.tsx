import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  "no-data": (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M16 20h16M16 26h12M16 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  empty: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M18 24l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "no-activity": (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M16 22h16M16 27h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="36" r="6" fill="currentColor" opacity="0.15" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M24 16v10M24 30v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function EmptyState({
  variant = "empty",
  message,
  hint,
}: {
  variant?: "no-data" | "empty" | "no-activity" | string;
  message: string;
  hint?: string;
}) {
  return (
    <div className="emptyState" data-variant={variant}>
      <div className="emptyState-icon" aria-hidden="true">
        {ICONS[variant] ?? DEFAULT_ICON}
      </div>
      <strong className="emptyState-message">{message}</strong>
      {hint ? <span className="emptyState-hint">{hint}</span> : null}
    </div>
  );
}
