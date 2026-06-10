import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for company/notes/[id] actions
// ---------------------------------------------------------------------------

/**
 * Validate a note UUID for get/delete operations.
 */
export const getNoteEntrySchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

export const deleteNoteEntrySchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

/**
 * Update note — validates the note UUID, text, and optional company ID.
 */
export const updateNoteEntrySchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
  noteText: z.string().min(1, "Note text is required"),
  companyId: z.number().int().positive("Company ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetNoteEntryInput = z.input<typeof getNoteEntrySchema>;
export type UpdateNoteEntryInput = z.input<typeof updateNoteEntrySchema>;
export type DeleteNoteEntryInput = z.input<typeof deleteNoteEntrySchema>;

export type NoteEntryResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};
