// ---------------------------------------------------------------------------
// Colocated server actions — student public profile
// Delegates to module-level actions in @/modules/student/actions
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
} from "@/modules/student/actions";

export type {
  StudentProfile,
  SkillItem,
  ExperienceItem,
} from "@/modules/student/actions";
