// ---------------------------------------------------------------------------
// Schemas for candidate/skills/new actions
// ---------------------------------------------------------------------------
// Re-exports the parent createSkillSchema since the validation shape is
// identical — the create action just validates input before delegating
// to the parent implementation.
// ---------------------------------------------------------------------------

import { createSkillSchema } from "../schemas";

export { createSkillSchema };

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export type { SkillActionResult } from "../actions";
