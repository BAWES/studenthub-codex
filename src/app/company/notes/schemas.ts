import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCompanyNotesSchema = z.object({
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getCompanyNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

export const createCompanyNoteSchema = z.object({
  company_id: z.number({ required_error: "Company ID is required" }).int().positive(),
  note_text: z.string({ required_error: "Note text is required" }).min(1).max(10000),
  note_type: z.string().max(100).optional(),
  created_by: z.number().int().positive().optional(),
});

export const updateCompanyNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
  note_text: z.string().min(1).max(10000).optional(),
  note_type: z.string().max(100).optional(),
  updated_by: z.number().int().positive().optional(),
});

export const deleteCompanyNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCompanyNotesInput = z.input<typeof listCompanyNotesSchema>;
export type CreateCompanyNoteInput = z.input<typeof createCompanyNoteSchema>;
export type UpdateCompanyNoteInput = z.input<typeof updateCompanyNoteSchema>;

export type CompanyNoteListItem = {
  note_uuid: string;
  note_text: string | null;
  note_type: string | null;
  company_id: number | null;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  company_name: string | null;
};

export type CompanyNoteDetail = {
  note_uuid: string;
  company_id: number | null;
  note_text: string | null;
  note_type: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  company_name: string | null;
};

export type ListCompanyNotesResult = {
  notes: CompanyNoteListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
