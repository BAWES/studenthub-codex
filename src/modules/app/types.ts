// ---------------------------------------------------------------------------
// Shared types for the hub workspace module
// ---------------------------------------------------------------------------

import type { Route } from "next";
import type { Role } from "@/modules/auth/types";

export type HubScope = "all" | "people" | "demand" | "companies" | "money" | "compliance";

export type HubResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta: string;
  href?: Route;
};

export type HubPreview = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta: string;
  href?: Route;
  actions: { label: string; href: string }[];
  flags: string[];
  facts: { label: string; value: string | number }[];
  related: {
    title: string;
    rows: { id: string | number; title: string; subtitle: string; meta: string; href?: Route }[];
  }[];
};

export type HubNavigationItem = {
  label: string;
  description: string;
  href: Route;
};

/**
 * Input type for getUnifiedHubAction.
 * Defined separately from the Zod schema so module actions can import it
 * without pulling in zod or "server-only" boundary concerns.
 */
export type HubInput = {
  query?: string;
  scope?: HubScope;
  record?: string;
};
