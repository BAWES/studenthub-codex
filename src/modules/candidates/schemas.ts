import { z } from "zod";

// ---------------------------------------------------------------------------
// Input Schemas
// ---------------------------------------------------------------------------

export const getCandidateProfileSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const updateCandidateProfileResultSchema = z.object({
  success: z.boolean(),
  fieldErrors: z.record(z.string(), z.array(z.string()).optional()).optional(),
});

export const candidateErrorResultSchema = z.object({
  error: z.string(),
});

export const candidateLanguageResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

const numericOptionSchema = z.object({
  id: z.number().int(),
  label: z.string(),
});

const uuidOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const getCountryOptionsResultSchema = z.array(numericOptionSchema);
export const getUniversityOptionsResultSchema = z.array(numericOptionSchema);
export const getBankOptionsResultSchema = z.array(numericOptionSchema);
export const getDegreeOptionsResultSchema = z.array(uuidOptionSchema);
export const getMajorOptionsResultSchema = z.array(uuidOptionSchema);

/**
 * Schema for form-action results with success + optional error (EducationState).
 */
export const educationStateResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

/**
 * Schema for simple form-action results returning { error: string }.
 * Covers success (error: "") and failure (non-empty error) cases.
 */
export const candidateActionErrorResultSchema = z.object({
  error: z.string(),
});

/**
 * Schema for changePassword result — discriminated union via z.union
 * (z.discriminatedUnion requires unique discriminant values; both
 * failure variants share success=false, so z.union is used instead).
 */
export const changePasswordResultSchema = z.union([
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
  z.object({ success: z.literal(false), fieldErrors: z.record(z.string(), z.array(z.string())) }),
]);

// ---------------------------------------------------------------------------
// Staff candidate detail schemas
// ---------------------------------------------------------------------------

export const getCandidateSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

export const addCandidateNoteSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  noteText: z.string().trim().min(1, "Note text is required"),
  noteType: z.string().optional().default("Internal Note"),
});

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

export type GetCandidateInput = z.input<typeof getCandidateSchema>;
export type AddCandidateNoteInput = z.input<typeof addCandidateNoteSchema>;

export type CandidateDetail = z.output<typeof candidateDetailOutputSchema>;
export type CandidateNote = z.output<typeof candidateNoteOutputSchema>;
export type CandidateDetailResult = z.output<
  typeof candidateDetailResultOutputSchema
>;
export type AddNoteResult = z.output<typeof addNoteResultOutputSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateProfileInput = z.input<typeof getCandidateProfileSchema>;
