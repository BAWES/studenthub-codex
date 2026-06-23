import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/admin/note actions
// ---------------------------------------------------------------------------

export const listNotesSchema = z.object({
  companyId: z.number().int().optional(),
  staffId: z.number().int().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  endDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const getNoteSchema = z.object({
  id: z.string().min(1, "Invalid note ID"),
});
export const createNoteSchema = z.object({
  noteText: z.string().min(1, "Note text is required"),
  companyId: z.number().int().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  noteType: z.string().optional(),
  candidateId: z.number().int().optional(),
});
export const updateNoteSchema = z.object({
  id: z.string().min(1, "Invalid note ID"),
  noteText: z.string().min(1, "Note text is required"),
  companyId: z.number().int().optional(),
});
export type ListNotesParams = z.input<typeof listNotesSchema>;
export type GetNoteParams = z.input<typeof getNoteSchema>;
export type CreateNoteParams = z.input<typeof createNoteSchema>;
export type UpdateNoteParams = z.input<typeof updateNoteSchema>;
// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const staffInfoSchema = z.object({
  staff_name: z.string(),
});

export const noteItemSchema = z.object({
  note_uuid: z.string(),
  company_id: z.number().int().nullable(),
  request_uuid: z.string().nullable(),
  story_uuid: z.string().nullable(),
  note_type: z.string().nullable(),
  note_text: z.string().nullable(),
  created_by: z.number().int().nullable(),
  updated_by: z.number().int().nullable(),
  note_created_datetime: z.date().nullable(),
  note_updated_datetime: z.date().nullable(),
  staff_created: staffInfoSchema.nullable(),
  staff_updated: staffInfoSchema.nullable(),
});

export const listNotesResultSchema = z.object({
  notes: z.array(noteItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const operationResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type NoteItem = z.output<typeof noteItemSchema>;
export type ListNotesResult = z.output<typeof listNotesResultSchema>;
