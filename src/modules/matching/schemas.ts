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
