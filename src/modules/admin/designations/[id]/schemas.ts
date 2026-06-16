import { z } from "zod";

// ---------------------------------------------------------------------------
// Designation Detail schemas — single-designation detail page
// ---------------------------------------------------------------------------

/**
 * Input schema for getDesignation.
 */
export const getDesignationSchema = z.object({
  designationUuid: z.string().min(1, "Designation UUID is required"),
});

/**
 * Schema for a single designation item in detail response.
 */
export const designationItemSchema = z.object({
  designation_uuid: z.string(),
  designation_name_en: z.string(),
  designation_name_ar: z.string().nullable(),
  designation_created_at: z.date().nullable(),
  designation_updated_at: z.date().nullable(),
});

/**
 * Output schema for getDesignation.
 */
export const getDesignationResultSchema = z.object({
  designation: designationItemSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type DesignationItem = z.output<typeof designationItemSchema>;
export type GetDesignationResult = z.output<typeof getDesignationResultSchema>;
export type GetDesignationInput = z.input<typeof getDesignationSchema>;
