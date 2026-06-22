// ---------------------------------------------------------------------------
// Employer Application Detail — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/employer/applications/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  getApplicationDetailSchema,
  getApplicationDetailOutputSchema,
  employerApplicationDetailOutputSchema,
  type GetApplicationDetailInput,
} from "@/modules/employer/applications/schemas";
