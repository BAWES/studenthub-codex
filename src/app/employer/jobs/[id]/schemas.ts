// ---------------------------------------------------------------------------
// Employer Job Detail — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/employer/jobs/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  getJobSchema,
  getJobResultSchema,
  jobRowSchema,
  type GetJobInput,
  type GetJobResult,
  type JobRowOutput,
} from "@/modules/employer/jobs/schemas";
