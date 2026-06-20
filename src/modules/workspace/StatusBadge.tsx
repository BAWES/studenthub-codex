"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Variant color maps — Tailwind semantic classes
// ---------------------------------------------------------------------------

const variantStyles: Record<string, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  error: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const sizeStyles: Record<string, string> = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2.5 py-0.5",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StatusBadgeVariant = keyof typeof variantStyles;
export type StatusBadgeSize = keyof typeof sizeStyles;

export interface StatusBadgeProps {
  /** Semantic variant defining the badge color */
  variant?: StatusBadgeVariant;
  /** Size preset */
  size?: StatusBadgeSize;
  /** Primary label text */
  label: string;
  /** Show loading skeleton animation */
  loading?: boolean;
  /** When true, renders additional detail context (role-scoping) */
  showDetails?: boolean;
  /** Extra context shown when showDetails is true */
  detail?: string;
  /** Additional CSS classes */
  className?: string;
  /** Enable OS-style glow effect around the badge */
  glow?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Shared <StatusBadge> component with semantic variants, sizes, loading state,
 * and role-scoped detail display.
 *
 * Variants: success (green), warning (amber), error (rose), info (blue), neutral (gray)
 * Sizes: sm (text-xs), md (text-sm)
 */
export function StatusBadge({
  variant = "neutral",
  size = "md",
  label,
  loading = false,
  showDetails = false,
  detail,
  glow = false,
  className,
}: StatusBadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold capitalize",
        variantStyles[variant],
        sizeStyles[size],
        loading && "animate-pulse",
        glow && "sh-glow",
        className,
      )}
    >
      {label}
      {showDetails && detail ? (
        <span className="text-[0.7em] opacity-70 normal-case">({detail})</span>
      ) : null}
    </span>
  );
}
