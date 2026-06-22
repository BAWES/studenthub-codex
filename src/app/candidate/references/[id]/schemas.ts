import { z } from "zod";
import { updateReferenceSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schemas for candidate/references/[id] actions
// ---------------------------------------------------------------------------

/** Validate a reference UUID string for get/delete operations. */
export const getReferenceEntrySchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

export const deleteReferenceEntrySchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

/**
 * Update reference entry — re-uses the parent update validation.
 */
export const updateReferenceEntrySchema = updateReferenceSchema;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetReferenceEntryInput = z.input<typeof getReferenceEntrySchema>;
export type UpdateReferenceEntryInput = z.input<typeof updateReferenceEntrySchema>;
export type DeleteReferenceEntryInput = z.input<typeof deleteReferenceEntrySchema>;

export type ReferenceEntryResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};
