"use client";

import { Badge } from "@/components/ui/badge";

/**
 * SearchStatusPill — displays search result stats as a coral-themed pill badge.
 *
 * Shows the count of results found. When no query returns results, shows
 * "No results" in coral-red. Designed as a small, self-contained badge
 * that fits in any header or toolbar.
 *
 * Styled with Zendesk coral (#eb6651) accent.
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
      <Badge
        variant="outline"
        className="inline-flex items-center gap-1 px-[10px] py-[3px] text-xs font-bold whitespace-nowrap bg-[rgba(235,102,81,0.1)] text-[#eb6651] border-[rgba(235,102,81,0.3)]"
        role="status"
      >
        No results
      </Badge>
    );
  }

  if (resultsCount === 0 && !query) return null;

  const formatted = resultsCount.toLocaleString("en-US");

  return (
    <Badge
      variant="outline"
      className="inline-flex items-center gap-1 px-[10px] py-[3px] text-xs font-bold whitespace-nowrap bg-[rgba(235,102,81,0.1)] text-[#eb6651] border-[rgba(235,102,81,0.3)]"
      role="status"
    >
      {formatted} results
    </Badge>
  );
}
