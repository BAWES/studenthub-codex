import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas — inspector ID request detail actions
// ---------------------------------------------------------------------------

/**
 * Result schema for mutation actions that return either success or error.
 * Used by updateIdRequestStatus.
 */
export const inspectorIdRequestActionResultSchema = z.union([
  z.object({ success: z.literal(true) }),
  z.object({ error: z.string() }),
]);

export type InspectorIdRequestActionResult = z.output<
  typeof inspectorIdRequestActionResultSchema
>;
