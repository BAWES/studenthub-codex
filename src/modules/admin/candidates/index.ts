// ---------------------------------------------------------------------------
// Admin Candidates - barrel exports
// ---------------------------------------------------------------------------

export {
  listCandidates,
  getCandidate,
  searchCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "./actions";

export type {
  ListCandidatesInput,
  GetCandidateInput,
  SearchCandidatesInput,
  CreateCandidateInput,
  UpdateCandidateInput,
  DeleteCandidateInput,
  CreateCandidateResult,
  UpdateCandidateResult,
  DeleteCandidateResult,
  CandidateRow,
  CandidateDetail,
} from "./schemas";

export {
  listCandidatesSchema,
  getCandidateSchema,
  searchCandidatesSchema,
  createCandidateSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailObjectOutputSchema,
  candidateDetailOutputSchema,
  candidateActionResultOutputSchema,
} from "./schemas";
