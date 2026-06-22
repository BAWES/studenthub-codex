"use server";

// ---------------------------------------------------------------------------
// Employer — page-level server actions barrel
// ---------------------------------------------------------------------------
// Re-exports employer sub-module actions for ease of import at the page
// level. Each sub-module (dashboard, jobs, applications) has its own
// "use server" actions with colocated Zod schemas and tests.
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
} from "@/modules/employer/jobs/schemas";
