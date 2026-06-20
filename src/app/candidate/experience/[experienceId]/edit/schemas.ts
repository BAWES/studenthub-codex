// ---------------------------------------------------------------------------
// Re-exports from parent candidate/experience schemas
// ---------------------------------------------------------------------------
// The edit route no longer defines its own types — they come from the shared
// parent schemas. This file exists as a compatibility shim for any imports
// that still reference ./schemas.
// ---------------------------------------------------------------------------

export {
  updateExperienceSchema as updateExperienceEntrySchema,
  experienceActionResultOutputSchema,
  type ExperienceActionResult,
  type UpdateExperienceInput as UpdateExperienceEntryInput,
} from "../../schemas";
