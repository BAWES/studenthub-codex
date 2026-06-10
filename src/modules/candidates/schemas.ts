import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for modules/candidates actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const getCandidateProfileSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
});

export type GetCandidateProfileInput = z.input<typeof getCandidateProfileSchema>;
