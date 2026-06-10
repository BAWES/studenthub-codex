import { hubScopes } from "@/modules/hub/data";

// ---------------------------------------------------------------------------
// Hub helpers (non-server-action utilities)
// ---------------------------------------------------------------------------

const HUB_SCOPES = ["all", "people", "demand", "companies", "money", "compliance"] as const;

export type HubScope = (typeof HUB_SCOPES)[number];

/**
 * Parse a raw scope parameter from URL search params into a valid HubScope.
 * Falls back to "all" for invalid or missing values.
 */
export function parseHubScope(value: string | string[] | undefined): HubScope {
  const scope = Array.isArray(value) ? value[0] : value;
  return scope && HUB_SCOPES.includes(scope as HubScope) ? (scope as HubScope) : "all";
}
