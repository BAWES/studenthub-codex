// ---------------------------------------------------------------------------
// Matching — barrel exports
// ---------------------------------------------------------------------------

export {
  matchCandidateToJob,
  listMatchingJobs,
  listMatchingCandidates,
  scoreJobForCandidate,
  scoreJobsForCandidate
} from "./actions";

export type {
  MatchCandidateToJobInput,
  ListMatchingJobsInput,
  ListMatchingCandidatesInput,
  MatchScore,
  MatchedJobRow,
  MatchedCandidateRow
} from "./schemas";

export {
  matchCandidateToJobSchema,
  listMatchingJobsSchema,
  listMatchingCandidatesSchema,
  matchScoreSchema,
  matchedJobRowSchema,
  matchedCandidateRowSchema,
  matchCandidateToJobResultSchema,
  listMatchingJobsResultSchema,
  listMatchingCandidatesResultSchema
} from "./schemas";
