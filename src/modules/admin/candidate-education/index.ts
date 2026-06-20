// ---------------------------------------------------------------------------
// Admin Candidate-education - barrel exports
// ---------------------------------------------------------------------------

export {
  listCandidateEducation,
  getCandidateEducation,
} from "./actions";

export type {
  ListCandidateEducationInput,
  CandidateEducationRow,
  ListCandidateEducationResult,
  GetCandidateEducationInput,
  CandidateEducationDetail,
  CandidateEducationDetailResult,
} from "./schemas";

export {
  listCandidateEducationSchema,
  candidateEducationRowSchema,
  listCandidateEducationResultSchema,
  getCandidateEducationInputSchema,
  candidateEducationDetailSchema,
  candidateEducationDetailResultSchema,
} from "./schemas";
