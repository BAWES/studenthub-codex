import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

export const addCandidateNoteSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  noteText: z.string().trim().min(1, "Note text is required"),
  noteType: z.string().optional().default("Internal Note"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateInput = z.input<typeof getCandidateSchema>;
export type AddCandidateNoteInput = z.input<typeof addCandidateNoteSchema>;

export type CandidateDetail = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender: number | null;
  objective: string | null;
  intro: string | null;
  photoUrl: string | null;
  civilId: string | null;
  hourlyRate: number | null;
  countryId: number | null;
  universityId: number | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CandidateNote = {
  uuid: string;
  text: string;
  type: string;
  createdBy: number | null;
  createdAt: string;
};

export type CandidateDetailResult = {
  candidate: CandidateDetail | null;
  notes: CandidateNote[];
};

export type AddNoteResult = {
  success: boolean;
  error?: string;
};
