// ---------------------------------------------------------------------------
// Candidate Experience — colocated server actions
// Delegates to module-level actions in @/modules/candidate/experience/actions
// ---------------------------------------------------------------------------

export {
  listCandidateExperience,
  getCandidateExperience,
  createCandidateExperience,
  updateCandidateExperience,
  deleteCandidateExperience,
} from "@/modules/candidate/experience/actions";

export type {
  ExperienceActionResult,
  ExperienceItem,
} from "@/modules/candidate/experience";
