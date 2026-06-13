import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single reference item.
 */
export const referenceItemSchema = z.object({
  reference_uuid: z.string().min(1),
  candidate_id: z.number().int().nullable(),
  name: z.string().min(1),
  company: z.string().nullable(),
  position: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  relationship: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});
export type ReferenceItem = z.output<typeof referenceItemSchema>;

/**
 * Schema for the list response (array of items).
 */
export const referenceListSchema = z.array(referenceItemSchema);

/**
 * Schema for mutation responses.
 */
export const referenceActionResultSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    referenceUuid: z.string().min(1, "Reference UUID is required"),
  }),
  z.object({ success: z.literal(false), error: z.string().min(1, "Error message is required") }),
]);
export type ReferenceActionResult = z.output<typeof referenceActionResultSchema>;
