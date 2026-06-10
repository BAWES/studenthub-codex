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

export type ActionResponse =
  | { success: true }
  | { success: false; error: string };
