import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const idCardItemSchema = z.object({
  id: z.number(),
  candidate_id: z.number().nullable(),
  expiry_date: z.date().nullable(),
  deleted: z.number(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type IdCardItem = z.output<typeof idCardItemSchema>;

export const listIdCardsResultSchema = z.object({
  idCards: z.array(idCardItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListIdCardsResult = z.output<typeof listIdCardsResultSchema>;

export const idCardActionResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

export type IdCardActionResult = z.output<typeof idCardActionResultSchema>;
