// ---------------------------------------------------------------------------
// Schemas for candidate/skills/[skillId] actions
// ---------------------------------------------------------------------------
// These re-export the parent schemas since the validation shapes are
// identical — detail actions just need to validate the input before
// delegating to the parent implementation.
// ---------------------------------------------------------------------------

import {
  getSkillSchema,
  updateSkillSchema,
  deleteSkillSchema,
} from "../schemas";

export { getSkillSchema, updateSkillSchema, deleteSkillSchema };

// ---------------------------------------------------------------------------
// Detail-action response types
// ---------------------------------------------------------------------------

export type { SkillActionResult, SkillItem } from "../actions";
