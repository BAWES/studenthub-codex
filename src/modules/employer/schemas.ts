import { z } from "zod";

// ---------------------------------------------------------------------------
// Employer — aggregate output validation schemas
// ---------------------------------------------------------------------------
// Re-exports Zod schemas from employer submodules (dashboard, jobs,
// applications) providing a single entrypoint for the employer module.
// ---------------------------------------------------------------------------

// -- Dashboard --
export {
  employerDashboardMetricSchema,
  recentApplicationSchema,
  jobStatusBreakdownSchema,
  employerDashboardDataSchema,
} from "./dashboard/schemas";

export type {
  EmployerDashboardMetric,
  RecentApplication,
  JobStatusBreakdown,
  EmployerDashboardData,
} from "./dashboard/schemas";

// -- Jobs --
export {
  jobRowSchema,
  listJobsResultSchema,
  getJobResultSchema,
  createJobResultSchema,
  updateJobResultSchema,
  deleteJobResultSchema,
  searchJobsResultSchema,
} from "./jobs/schemas";

export type {
  JobRowOutput,
  ListJobsResult,
  GetJobResult,
  CreateJobResultOutput,
  UpdateJobResultOutput,
  DeleteJobResultOutput,
} from "./jobs/schemas";

// -- Applications --
export {
  employerApplicationRowOutputSchema,
  employerApplicationListOutputSchema,
  employerApplicationDetailOutputSchema,
  getApplicationDetailOutputSchema,
} from "./applications/schemas";

export type {
  EmployerApplicationRow,
  ListEmployerApplicationsInput,
  GetApplicationDetailInput,
} from "./applications/schemas";

// -- Employer-level input schemas --
export {
  listJobsSchema,
  getJobSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
} from "./jobs/schemas";

export {
  listEmployerApplicationsSchema,
  getApplicationDetailSchema,
} from "./applications/schemas";

export type {
  ListJobsInput,
  GetJobInput,
  CreateJobInput,
  UpdateJobInput,
  DeleteJobInput,
} from "./jobs/schemas";
