// ---------------------------------------------------------------------------
// Candidates — barrel exports
// ---------------------------------------------------------------------------

export {
  updateCandidateProfile,
  uploadDocument,
  respondToInvitation,
  appealWorkLog,
  getCountryOptions,
  getUniversityOptions,
  getBankOptions,
  addCandidateSkill,
  removeCandidateSkill,
  addCandidateLanguage,
  removeCandidateLanguage,
  getDegreeOptions,
  getMajorOptions,
  addCandidateExperience,
  removeCandidateExperience,
  addCandidateCertificate,
  removeCandidateCertificate,
  addCandidateEducation,
  editCandidateEducation,
  removeCandidateEducation,
  addStaffCandidateNote,
  editStaffCandidateNote,
  addStaffCandidateTag,
  removeStaffCandidateTag,
  addStaffCandidateWarning,
  removeStaffCandidateWarning,
  addStaffCandidateSkill,
  removeStaffCandidateSkill,
  setCandidateApproval,
  setCandidateProfileComplete,
  clearCandidateCivilVerification,
} from "./actions";

export type {
  ProfileState,
  EducationState,
  LanguageState,
} from "./actions";
