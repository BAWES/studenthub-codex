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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateProfileInput = z.input<typeof getCandidateProfileSchema>;
