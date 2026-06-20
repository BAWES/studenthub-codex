import { z } from "zod";

// ---------------------------------------------------------------------------
// Major Detail schemas — single-major detail page
// ---------------------------------------------------------------------------

/**
 * Input schema for getMajor.
 */
export const getMajorSchema = z.object({
  majorUuid: z.string().min(1, "Major UUID is required"),
});

/**
 * Schema for a single major item in detail response.
 */
export const majorItemSchema = z.object({
  major_uuid: z.string().min(1),
  major_name_en: z.string().min(1),
  major_name_ar: z.string().min(1),
  data_source: z.number().int().nullable().optional(),
  major_created_at: z.date().nullable(),
  major_updated_at: z.date().nullable(),
});

/**
 * Output schema for getMajor.
 */
export const getMajorResultSchema = z.object({
  major: majorItemSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type MajorItem = z.output<typeof majorItemSchema>;
export type GetMajorResult = z.output<typeof getMajorResultSchema>;
export type GetMajorInput = z.input<typeof getMajorSchema>;
