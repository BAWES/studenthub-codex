import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — job-candidate matching
// ---------------------------------------------------------------------------

export const matchCandidateToJobSchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  jobId: z.coerce.number().int().positive(),
});

export const listMatchingJobsSchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  employmentType: z.string().optional(),
  location: z.string().optional(),
});

export const listMatchingCandidatesSchema = z.object({
  jobId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  minScore: z.coerce.number().min(0).max(100).optional(),
  skillFilter: z.string().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  majorFilter: z.string().optional(),
});

export type MatchCandidateToJobInput = z.input<typeof matchCandidateToJobSchema>;
export type ListMatchingJobsInput = z.input<typeof listMatchingJobsSchema>;
export type ListMatchingCandidatesInput = z.input<typeof listMatchingCandidatesSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MatchScore = {
  overall: number;           // 0-100
  skillMatch: number;        // 0-100
  educationMatch: number;    // 0-100
  locationMatch: number;     // 0-100
  breakdown: string[];       // human-readable bullet points
};

export type MatchedJobRow = {
  jobListingId: number;
  title: string;
  employerName: string;
  location: string | null;
  employmentType: string | null;
  salaryRange: string | null;
  score: MatchScore;
};

export type MatchedCandidateRow = {
  candidateId: number;
  candidateName: string;
  candidateSkills: string[];
  universityName: string | null;
  score: MatchScore;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const matchScoreSchema = z.object({
  overall: z.number().int().min(0).max(100),
  skillMatch: z.number().int().min(0).max(100),
  educationMatch: z.number().int().min(0).max(100),
  locationMatch: z.number().int().min(0).max(100),
  breakdown: z.array(z.string()),
});

export const matchedJobRowSchema = z.object({
  jobListingId: z.number().int().positive(),
  title: z.string(),
  employerName: z.string(),
  location: z.string().nullable(),
  employmentType: z.string().nullable(),
  salaryRange: z.string().nullable(),
  score: matchScoreSchema,
});

export const matchedCandidateRowSchema = z.object({
  candidateId: z.number().int().positive(),
  candidateName: z.string(),
  candidateSkills: z.array(z.string()),
  universityName: z.string().nullable(),
  score: matchScoreSchema,
});

export const matchCandidateToJobResultSchema = z.object({
  success: z.boolean(),
  score: matchScoreSchema,
});

export const listMatchingJobsResultSchema = z.object({
  success: z.boolean(),
  jobs: z.array(matchedJobRowSchema),
  total: z.number().int().nonnegative(),
});

export const listMatchingCandidatesResultSchema = z.object({
  success: z.boolean(),
  candidates: z.array(matchedCandidateRowSchema),
  total: z.number().int().nonnegative(),
});
