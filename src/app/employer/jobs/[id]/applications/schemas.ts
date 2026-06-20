// ---------------------------------------------------------------------------
// Employer Job Applications — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/employer/jobs/[id]/applications/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listJobApplicationsSchema,
  listJobApplicationsByEmployerSchema,
  updateApplicationStatusSchema,
  type ListJobApplicationsInput,
  type ListJobApplicationsByEmployerInput,
  type UpdateApplicationStatusInput,
  type JobApplicationRow,
  jobApplicationRowOutputSchema,
  jobApplicationWithJobRowOutputSchema,
  jobApplicationListOutputSchema,
  jobApplicationListByEmployerOutputSchema,
  updateApplicationStatusOutputSchema,
} from "@/modules/employer/jobs/[id]/applications/schemas";
