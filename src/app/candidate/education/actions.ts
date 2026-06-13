// ---------------------------------------------------------------------------
// Candidate Education — colocated server actions
// Delegates to module-level actions in @/modules/candidates/education/actions
// ---------------------------------------------------------------------------

export {
  listCandidateEducationAction,
  getCandidateEducationAction,
  createCandidateEducationAction,
  updateCandidateEducationAction,
  deleteCandidateEducationAction,
} from "@/modules/candidates/education/actions";

export type {
  CandidateEducationItem,
  CandidateEducationActionResult,
} from "@/modules/candidates/education/schemas";
