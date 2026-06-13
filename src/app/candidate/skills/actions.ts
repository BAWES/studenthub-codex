// ---------------------------------------------------------------------------
// Candidate Skills — colocated server actions
// Delegates to module-level actions in @/modules/candidates/skills/actions
// ---------------------------------------------------------------------------

export {
  listCandidateSkills,
  getCandidateSkill,
  createCandidateSkill,
  updateCandidateSkill,
  deleteCandidateSkill,
} from "@/modules/candidates/skills/actions";

export type {
  SkillItem,
  SkillListResult,
  SkillActionResult,
} from "@/modules/candidates/skills/schemas";
