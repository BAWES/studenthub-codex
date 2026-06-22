// ---------------------------------------------------------------------------
// Candidate Skill [skillId] — colocated server actions
// Delegates to module-level actions in @/modules/candidates/skills/actions
// ---------------------------------------------------------------------------

export {
  getCandidateSkill as getSkill,
  updateCandidateSkill as updateSkill,
  deleteCandidateSkill as deleteSkill,
} from "@/modules/candidates/skills/actions";

export type {
  SkillItem,
  SkillActionResult,
} from "@/modules/candidates/skills/schemas";
