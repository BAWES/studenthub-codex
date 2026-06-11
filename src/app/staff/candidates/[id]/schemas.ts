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

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/** Validates a candidate note object. */
export const candidateNoteOutputSchema = z.object({
  uuid: z.string(),
  text: z.string(),
  type: z.string(),
  createdBy: z.number().int().nullable(),
  createdAt: z.string(),
});

/** Validates the candidate detail output. */
export const candidateDetailOutputSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  gender: z.number().int().nullable(),
  objective: z.string().nullable(),
  intro: z.string().nullable(),
  photoUrl: z.string().nullable(),
  civilId: z.string().nullable(),
  hourlyRate: z.number().nullable(),
  countryId: z.number().int().nullable(),
  universityId: z.number().int().nullable(),
  birthDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Validates the full candidate detail result (candidate + notes). */
export const candidateDetailResultOutputSchema = z.object({
  candidate: candidateDetailOutputSchema.nullable(),
  notes: z.array(candidateNoteOutputSchema),
});

/** Validates the add-note result. */
export const addNoteResultOutputSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
