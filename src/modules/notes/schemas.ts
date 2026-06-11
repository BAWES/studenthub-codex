import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas (moved from actions.ts)
// ---------------------------------------------------------------------------

export const listNotesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  staffId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  noteType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  candidateId: z.coerce.number().int().positive().optional(),
});

export const getNoteSchema = z.object({
  uuid: z.string().min(1, "Note UUID is required"),
});

export const createNoteSchema = z.object({
  noteText: z.string().min(1, "Note text is required"),
  companyId: z.coerce.number().int().positive().optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  noteType: z.string().optional().default("Internal Note"),
});

export const updateNoteSchema = z.object({
  uuid: z.string().min(1, "Note UUID is required"),
  noteText: z.string().min(1, "Note text is required").optional(),
  noteType: z.string().optional(),
});

export const deleteNoteSchema = z.object({
  uuid: z.string().min(1, "Note UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const noteListItemSchema = z.object({
  note_uuid: z.string(),
  note_type: z.string().nullable(),
  note_text: z.string().nullable(),
  company_id: z.number().int().nullable(),
  candidate_id: z.number().int().nullable(),
  created_by: z.number().int().nullable(),
  note_created_datetime: z.date().nullable(),
});

export const noteDetailSchema = noteListItemSchema.extend({
  note_updated_datetime: z.date().nullable(),
  updated_by: z.number().int().nullable(),
  request_uuid: z.string().nullable(),
  story_uuid: z.string().nullable(),
});

export const noteDetailNullableSchema = noteDetailSchema.nullable();

export const listNotesResultSchema = z.object({
  notes: z.array(noteListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const operationResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

export const createNoteResultSchema = operationResultSchema.extend({
  note: noteDetailSchema.optional(),
});

export const updateNoteResultSchema = operationResultSchema.extend({
  note: noteDetailSchema.optional(),
});

export const deleteNoteResultSchema = operationResultSchema;

// ---------------------------------------------------------------------------
// Types (derived from schemas where possible)
// ---------------------------------------------------------------------------

export type ListNotesParams = z.input<typeof listNotesSchema>;
export type GetNoteParams = z.input<typeof getNoteSchema>;
export type CreateNoteParams = z.input<typeof createNoteSchema>;
export type UpdateNoteParams = z.input<typeof updateNoteSchema>;
export type DeleteNoteParams = z.input<typeof deleteNoteSchema>;

export type NoteListItem = z.output<typeof noteListItemSchema>;
export type NoteDetail = z.output<typeof noteDetailSchema>;
export type ListNotesResult = z.output<typeof listNotesResultSchema>;
