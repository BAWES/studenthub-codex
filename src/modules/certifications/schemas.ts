import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single certification item.
 */
export const certificationItemSchema = z.object({
  certification_id: z.number().int(),
  certification_name: z.string(),
  issuing_organization: z.string(),
  issue_date: z.date().nullable(),
  expiry_date: z.date().nullable(),
  credential_id: z.string().nullable(),
  credential_url: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});
export type CertificationItem = z.output<typeof certificationItemSchema>;

/**
 * Schema for the list response (array of items).
 */
export const certificationListSchema = z.array(certificationItemSchema);

/**
 * Schema for mutation responses.
 */
export const certificationActionResultSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    certificationId: z.number().int(),
  }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
export type CertificationActionResult = z.output<typeof certificationActionResultSchema>;
