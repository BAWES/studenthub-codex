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
  changePassword,
  getCandidateProfile,
  getCandidate,
  addCandidateNote
} from "./actions";

export type {
  GetCandidateInput,
  AddCandidateNoteInput,
  CandidateDetail,
  CandidateNote,
  CandidateDetailResult,
  AddNoteResult,
  GetCandidateProfileInput
} from "./schemas";

export {
  getCandidateProfileSchema,
  updateCandidateProfileResultSchema,
  candidateErrorResultSchema,
  candidateLanguageResultSchema,
  getCountryOptionsResultSchema,
  getUniversityOptionsResultSchema,
  getBankOptionsResultSchema,
  getDegreeOptionsResultSchema,
  getMajorOptionsResultSchema,
  educationStateResultSchema,
  candidateActionErrorResultSchema,
  changePasswordResultSchema,
  getCandidateSchema,
  addCandidateNoteSchema,
  candidateNoteOutputSchema,
  candidateDetailOutputSchema,
  candidateDetailResultOutputSchema,
  addNoteResultOutputSchema
} from "./schemas";
