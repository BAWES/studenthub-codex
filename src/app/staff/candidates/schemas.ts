// ---------------------------------------------------------------------------
// Staff — Candidates Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/staff/candidates/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listCandidatesSchema,
  getCandidateByIdSchema,
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
  type ListCandidatesInput,
  type GetCandidateByIdInput,
  type CandidateRow,
  type CandidateDetail,
  type ListCandidatesResult,
} from "@/modules/staff/candidates/schemas";
