// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in @/modules/candidate/experience/actions (which
// has "use server"). This barrel re-exports so the ExperienceEditForm keeps
// its current import path without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { updateExperienceEntry } from "@/modules/candidate/experience/actions";
export type { ExperienceActionResult } from "@/modules/candidate/experience/index";
