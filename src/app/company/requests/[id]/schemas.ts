import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Result schema for mutation actions that return either success or error.
 * Used by updateRequestStatus and deleteRequest.
 */
export const companyRequestActionResultSchema = z.union([
  z.object({ success: z.literal(true) }),
  z.object({ error: z.string() }),
]);

export type CompanyRequestActionResult = z.output<
  typeof companyRequestActionResultSchema
>;
