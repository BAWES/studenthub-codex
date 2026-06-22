// ---------------------------------------------------------------------------
// Standardized empty state messages for StudentHub data tables
// Single source of truth — import these instead of hardcoding strings.
// ---------------------------------------------------------------------------

/** Generic empty state when a data set has no records at all. */
export const EMPTY_NO_RECORDS = "No records found";

/** Hint text shown below the empty message. */
export const EMPTY_HINT_DEFAULT = "No records are available yet in this view.";

/**
 * Returns a search-specific empty message for a given query.
 * @param query The user's search term.
 */
export function emptyNoResults(query: string): string {
  return `No results matching "${query}". Try a different search term.`;
}

// ---------------------------------------------------------------------------
// Context-specific empty messages
// ---------------------------------------------------------------------------

/** Shown on a detail page when there are no related/linked records. */
export const EMPTY_NO_RELATED_RECORDS = "No related records found.";

/** Shown in a detail panel/section that has no data. */
export const EMPTY_NO_SECTION_DATA = "No data for this section.";

/** Shown in a detail panel list section when no imported records exist. */
export const EMPTY_NO_IMPORTED_RECORDS = "No imported records found here yet.";

/** Shown on a dashboard when no recent activity exists. */
export const EMPTY_NO_RECENT_ACTIVITY = "No recent activity.";
