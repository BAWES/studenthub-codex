import { z } from "zod";
import { updateEducationSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schemas for candidate/education/[id] actions
// ---------------------------------------------------------------------------

/**
 * Validate an education UUID string for get/delete operations.
 */
export const getEducationEntrySchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

export const deleteEducationEntrySchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

/**
 * Update education entry — re-uses the parent update validation which
 * already validates universityId, degreeUuid, majorUuid, graduationYear,
 * and isCurrentlyStudying fields.
 */
export const updateEducationEntrySchema = updateEducationSchema;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetEducationEntryInput = z.input<typeof getEducationEntrySchema>;
export type UpdateEducationEntryInput = z.input<typeof updateEducationEntrySchema>;
export type DeleteEducationEntryInput = z.input<typeof deleteEducationEntrySchema>;

export type EducationEntryResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};
