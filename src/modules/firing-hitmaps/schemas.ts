import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listFiringHitmapsSchema = z.object({
  companyId: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getFiringHitmapSchema = z.object({
  uuid: z.string().min(1, "Firing hitmap UUID is required"),
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single firing hitmap item returned from list / get actions.
 */
export const firingHitmapItemSchema = z.object({
  fh_uuid: z.string(),
  company_id: z.number().int(),
  firing_month: z.number().int(),
  firing_year: z.number().int(),
  total: z.number().int().nullable(),
  is_alerted: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Schema for getFiringHitmap result (hitmap or null, with optional error).
 */
export const getFiringHitmapResultSchema = z.object({
  hitmap: firingHitmapItemSchema.nullable(),
  error: z.string().optional(),
});

/**
 * Schema for the listFiringHitmaps response.
 */
export const listFiringHitmapsResultSchema = z.object({
  hitmaps: z.array(firingHitmapItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListFiringHitmapsParams = z.input<typeof listFiringHitmapsSchema>;
export type GetFiringHitmapParams = z.input<typeof getFiringHitmapSchema>;

export type FiringHitmapItem = z.output<typeof firingHitmapItemSchema>;
export type ListFiringHitmapsResult = z.output<typeof listFiringHitmapsResultSchema>;
export type GetFiringHitmapResult = z.output<typeof getFiringHitmapResultSchema>;
