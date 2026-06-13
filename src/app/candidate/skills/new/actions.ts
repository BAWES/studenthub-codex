// ---------------------------------------------------------------------------
// Candidate Skill New — colocated server actions
// Delegates to module-level actions in @/modules/candidates/skills/actions
// ---------------------------------------------------------------------------

export {
  createCandidateSkill as createSkill,
} from "@/modules/candidates/skills/actions";

export type {
  SkillActionResult,
} from "@/modules/candidates/skills/schemas";
