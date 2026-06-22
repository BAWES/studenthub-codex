"use client";

import { StatusBadge } from "@/components/ui/status-badge";

/**
 * SearchStatusPill — displays search result stats as a coral-themed pill badge.
 *
 * Shows the count of results found. When no query returns results, shows
 * "No results" in coral-red. Designed as a small, self-contained badge
 * that fits in any header or toolbar.
 *
 * Uses shadcn StatusBadge with warning variant for coral (#eb6651) accent.
 */
export function SearchStatusPill({
  resultsCount,
  query,
}: {
  /** Number of results shown on the current page */
  resultsCount: number;
  /** The active search query, if any */
  query?: string;
}) {
  if (resultsCount === 0 && query) {
    return (
      <StatusBadge status="warning" showDot role="status">
        No results
      </StatusBadge>
    );
  }

  if (resultsCount === 0 && !query) return null;

  const formatted = resultsCount.toLocaleString("en-US");

  return (
    <StatusBadge status="warning" showDot role="status">
      {formatted} results
    </StatusBadge>
  );
}
