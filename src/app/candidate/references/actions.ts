// ---------------------------------------------------------------------------
// Candidate References — colocated server actions
// Delegates to module-level actions in @/modules/candidates/references/actions
// ---------------------------------------------------------------------------

export {
  listCandidateReferences,
  getCandidateReference,
  createCandidateReference,
  updateCandidateReference,
  deleteCandidateReference,
} from "@/modules/candidates/references/actions";

export type {
  CandidateReferenceItem,
  ListCandidateReferencesResult,
  CandidateReferenceActionResult,
} from "@/modules/candidates/references";
