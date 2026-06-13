// ---------------------------------------------------------------------------
// Student — barrel exports
// ---------------------------------------------------------------------------

export {
  getStudentProfile,
  updateStudentProfile,
  listSkills,
  addSkill,
  removeSkill,
  listExperience,
  addExperience,
  updateExperience,
  removeExperience,
} from "./actions";

export type {
  StudentProfile,
  SkillItem,
  ExperienceItem,
} from "./actions";
