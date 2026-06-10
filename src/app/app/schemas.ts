import { z } from "zod";
import { HUB_SCOPES } from "./utils";

// ---------------------------------------------------------------------------
// Hub workspace — Zod schemas
// ---------------------------------------------------------------------------

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
