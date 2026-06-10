import { z } from "zod";

// ---------------------------------------------------------------------------
// Hub workspace — Zod schemas
// ---------------------------------------------------------------------------

const HUB_SCOPES = ["all", "people", "demand", "companies", "money", "compliance"] as const;

/**
 * Schema for getUnifiedHubAction input.
 * Validates the query, scope, and record parameters.
 */
export const getHubInputSchema = z.object({
  query: z
    .string()
    .optional()
    .default("")
    .transform((v) => v.trim()),
  scope: z
    .enum(HUB_SCOPES)
    .optional()
    .default("all"),
  record: z.string().optional(),
});

export type HubInput = z.input<typeof getHubInputSchema>;

// ---------------------------------------------------------------------------
// Type — mirrors the return shape from getUnifiedHub
// ---------------------------------------------------------------------------

export type HubScope = (typeof HUB_SCOPES)[number];
