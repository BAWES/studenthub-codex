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
export type NoteItem = {
  note_uuid: string;
  company_id: number | null;
  request_uuid: string | null;
  story_uuid: string | null;
  note_type: string | null;
  note_text: string | null;
  created_by: number | null;
  updated_by: number | null;
  note_created_datetime: Date | null;
  note_updated_datetime: Date | null;
  staff_created: { staff_name: string } | null;
  staff_updated: { staff_name: string } | null;
};
export type ListNotesResult = {
  notes: NoteItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
