// ---------------------------------------------------------------------------
// Pure helper functions for the hub workspace module
// ---------------------------------------------------------------------------

import type { Role } from "@/modules/auth/types";
import type { HubResult, HubScope } from "./types";

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

export function ratio(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

// ---------------------------------------------------------------------------
// Scope helpers
// ---------------------------------------------------------------------------

export function shouldQuery(scope: HubScope, scopes: HubScope[]) {
  return scopes.includes(scope);
}

const SCOPE_LABELS: Record<HubScope, string> = {
  all: "All",
  people: "People",
  demand: "Demand",
  companies: "Companies",
  money: "Money",
  compliance: "Compliance",
};

export const hubScopes = Object.entries(SCOPE_LABELS).map(([value, label]) => ({
  value: value as HubScope,
  label,
}));

export function scopesForRole(role: Role) {
  const values: Record<Role, HubScope[]> = {
    admin: ["all", "people", "demand", "companies", "money", "compliance"],
    staff: ["all", "people", "demand"],
    candidate: ["all", "people"],
    company: ["all", "demand", "companies"],
    inspector: ["all", "compliance"],
  };
  return hubScopes.filter((scope) => values[role].includes(scope.value));
}

// ---------------------------------------------------------------------------
// Record helpers
// ---------------------------------------------------------------------------

export function hubResultFromRecord(record: string): HubResult | null {
  if (record.startsWith("candidate-")) {
    return {
      id: record,
      type: "Candidate",
      title: "Candidate record",
      subtitle: "Loading candidate",
      meta: "Selected record",
    };
  }
  if (record.startsWith("company-")) {
    return {
      id: record,
      type: "Company",
      title: "Company record",
      subtitle: "Loading company",
      meta: "Selected record",
    };
  }
  if (record.startsWith("request-")) {
    return {
      id: record,
      type: "Request",
      title: "Request record",
      subtitle: "Loading request",
      meta: "Selected record",
    };
  }
  if (record.startsWith("transfer-")) {
    return {
      id: record,
      type: "Transfer",
      title: "Transfer record",
      subtitle: "Loading transfer",
      meta: "Selected record",
    };
  }
  if (record.startsWith("id-")) {
    return {
      id: record,
      type: "ID Request",
      title: "ID request record",
      subtitle: "Loading ID batch",
      meta: "Selected record",
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

export function compactText(value: string | null | undefined, max = 120) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return "No detail";
  return normalized.length > max
    ? `${normalized.slice(0, max - 1)}...`
    : normalized;
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

export function parseCandidateIds(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}
