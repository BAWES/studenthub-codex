// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in @/modules/candidate/experience/actions (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  getExperienceEntry,
  updateExperienceEntry,
  deleteExperienceEntry,
} from "@/modules/candidate/experience/actions";
export type { ExperienceActionResult, ExperienceItem } from "@/modules/candidate/experience/index";
