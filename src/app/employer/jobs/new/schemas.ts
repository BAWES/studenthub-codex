// ---------------------------------------------------------------------------
// Employer Job New — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/employer/jobs/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  createJobSchema,
  createJobResultSchema,
  type CreateJobInput,
  type CreateJobResultOutput,
} from "@/modules/employer/jobs/schemas";
