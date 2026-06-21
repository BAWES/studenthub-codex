import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/payments/[id] actions
// ---------------------------------------------------------------------------

export const getPaymentSchema = z.object({
  tcId: z.coerce.number().int().positive("Payment ID must be a positive integer"),
});

export const deletePaymentSchema = z.object({
  tcId: z.coerce.number().int().positive("Payment ID must be a positive integer"),
});

export type GetPaymentParams = z.input<typeof getPaymentSchema>;
export type DeletePaymentParams = z.input<typeof deletePaymentSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates that a payment record exists (non-null) with a valid tc_id.
 */
export const paymentExistenceSchema = z
  .object({ tc_id: z.number().int().positive() })
  .nullable();

/**
 * Discriminated union for action results.
 */
export const paymentActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export type ActionResponse =
  | { success: true }
  | { success: false; error: string };
