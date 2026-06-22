// Colocated server actions — candidate edit profile
// Delegates to module-level actions in @/modules/candidate/edit/actions
// ---------------------------------------------------------------------------

export {
  getCandidateProfileEdit,
  getCountryOptions,
  getUniversityOptions,
  getBankOptions,
  getDegreeOptions,
  getMajorOptions,
  getCandidateProfileForEdit,
  updateCandidatePersonalInfo,
  updateCandidateProfileFields,
} from "@/modules/candidate/edit/actions";

export type {
  CandidateProfileEditData,
  ProfileActionResult,
} from "@/modules/candidate/edit";
