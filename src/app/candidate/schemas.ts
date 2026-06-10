import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — colocated with candidate root page actions
// ---------------------------------------------------------------------------

export const getCandidateProfileSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateProfileInput = z.input<typeof getCandidateProfileSchema>;
