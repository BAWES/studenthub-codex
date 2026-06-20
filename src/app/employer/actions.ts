"use server";

// ---------------------------------------------------------------------------
// Employer — page-level server actions
// ---------------------------------------------------------------------------
// Re-exports employer module-level actions for page convenience imports.
// All business logic lives in src/modules/employer/{sub-module}/actions.ts.
// ---------------------------------------------------------------------------

export {
  getMyEmployerId,
  listJobs,
  getJob,
  createJob,
  updateJob,
  closeJob,
  deleteJob,
} from "@/modules/employer/jobs/actions";

export type {
  ListJobsInput,
  GetJobInput,
  CreateJobInput,
  UpdateJobInput,
  DeleteJobInput,
  CloseJobInput,
  JobRow,
  ListJobsResult,
  GetJobResult,
} from "@/modules/employer/jobs/schemas";
