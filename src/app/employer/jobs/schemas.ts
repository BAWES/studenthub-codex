// ---------------------------------------------------------------------------
// Employer Job Posting — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/employer/jobs/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listJobsSchema,
  getJobSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
  type ListJobsInput,
  type GetJobInput,
  type CreateJobInput,
  type UpdateJobInput,
  type DeleteJobInput,
  type JobRow,
  type CreateJobResult,
  type UpdateJobResult,
  type DeleteJobResult,
} from "@/modules/employer/jobs/schemas";
