import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — colocated with candidate job browsing & application server actions
// ---------------------------------------------------------------------------

export const listCandidateJobsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  employmentType: z.string().optional(),
  location: z.string().optional(),
  minSalary: z.coerce.number().min(0).optional(),
  maxSalary: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["newest", "match"]).default("newest"),
});

export const getCandidateJobSchema = z.object({
  jobId: z.coerce.number().int().positive("Job ID is required"),
});

export const applyToJobSchema = z.object({
  jobListingId: z.coerce.number().int().positive(),
  coverLetter: z.string().optional(),
});

export const listMyApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

export const listJobApplicationsSchema = z.object({
  jobListingId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Output validation — Zod schemas for server action return types
// ---------------------------------------------------------------------------

/**
 * A single job listing row in the candidate browse view.
 */
export const candidateJobRowSchema = z.object({
  jobListingId: z.number().int().positive(),
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  requirements: z.string().nullable(),
  location: z.string().nullable(),
  employmentType: z.string().nullable(),
  salaryRange: z.string().nullable(),
  employerName: z.string().min(1, "Employer name is required"),
  matchScore: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Full job detail including match breakdown and application status.
 */
export const candidateJobDetailSchema = candidateJobRowSchema.extend({
  status: z.string().nullable(),
  hasApplied: z.boolean(),
  applicationStatus: z.string().nullable(),
  skillScore: z.number().nullable(),
  educationScore: z.number().nullable(),
  locationScore: z.number().nullable(),
  breakdown: z.array(z.string()),
});

/**
 * A single application row in the candidate's application list.
 */
export const applicationRowSchema = z.object({
  applicationId: z.number().int().positive(),
  jobListingId: z.number().int().positive(),
  jobTitle: z.string().min(1, "Job title is required"),
  employerName: z.string().min(1, "Employer name is required"),
  status: z.string().min(1, "Status is required"),
  coverLetter: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Paginated list result schema (listCandidateJobs).
 */
export const listCandidateJobsResultSchema = z.object({
  success: z.literal(true),
  jobs: z.array(candidateJobRowSchema),
  total: z.number().int().nonnegative(),
});

/**
 * Single job detail result schema (getCandidateJob).
 */
export const getCandidateJobResultSchema = z.object({
  success: z.literal(true),
  job: candidateJobDetailSchema,
});

/**
 * Apply result schema (applyToJob).
 */
export const applyToJobResultSchema = z.object({
  success: z.literal(true),
  applicationId: z.number().int().positive(),
  message: z.string(),
});

/**
 * My applications list result schema (listMyApplications).
 */
export const listMyApplicationsResultSchema = z.object({
  success: z.literal(true),
  applications: z.array(applicationRowSchema),
  total: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types — input type aliases
// ---------------------------------------------------------------------------

export type ListCandidateJobsInput = z.input<typeof listCandidateJobsSchema>;
export type GetCandidateJobInput = z.input<typeof getCandidateJobSchema>;
export type ApplyToJobInput = z.input<typeof applyToJobSchema>;
export type ListMyApplicationsInput = z.input<typeof listMyApplicationsSchema>;
export type ListJobApplicationsInput = z.input<typeof listJobApplicationsSchema>;

// ---------------------------------------------------------------------------
// Types — output type aliases
// ---------------------------------------------------------------------------

export type CandidateJobRow = z.output<typeof candidateJobRowSchema>;
export type CandidateJobDetail = z.output<typeof candidateJobDetailSchema>;
export type ApplicationRow = z.output<typeof applicationRowSchema>;

export type JobApplicationRow = {
  applicationId: number;
  candidateId: number;
  candidateName: string | null;
  status: string;
  coverLetter: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ApplyToJobResult =
  | { success: true; applicationId: number }
  | { success: false; error: string };

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
