// ---------------------------------------------------------------------------
// Hub utilities (non-server-action, non-DB helpers)
// ---------------------------------------------------------------------------

import type { HubScope } from "./types";

export const HUB_SCOPES = [
  "all",
  "people",
  "demand",
  "companies",
  "money",
  "compliance",
] as const;

const SCOPE_LABELS: Record<HubScope, string> = {
  all: "All",
  people: "People",
  demand: "Demand",
  companies: "Companies",
  money: "Money",
  compliance: "Compliance",
};

/**
 * Parse a raw scope parameter from URL search params into a valid HubScope.
 * Falls back to "all" for invalid or missing values.
 */
export function parseHubScope(
  value: string | string[] | undefined,
): HubScope {
  const scope = Array.isArray(value) ? value[0] : value;
  return scope && scope in SCOPE_LABELS
    ? (scope as HubScope)
    : "all";
}
