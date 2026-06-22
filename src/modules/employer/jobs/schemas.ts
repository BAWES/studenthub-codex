import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — colocated with employer job listing server actions
// ---------------------------------------------------------------------------

export const listJobsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  q: z.string().optional(),
});

export const getJobSchema = z.object({
  jobId: z.coerce.number().int().positive("Job ID is required"),
});

export const createJobSchema = z.object({
  employerId: z.coerce.number().int().positive(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  salaryRange: z.string().optional(),
  status: z.string().default("active"),
});

export const updateJobSchema = z.object({
  jobId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  requirements: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  salaryRange: z.string().optional(),
  status: z.string().optional(),
});

export const deleteJobSchema = z.object({
  jobId: z.coerce.number().int().positive(),
});

export const closeJobSchema = z.object({
  jobId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListJobsInput = z.input<typeof listJobsSchema>;
export type GetJobInput = z.input<typeof getJobSchema>;
export type CreateJobInput = z.input<typeof createJobSchema>;
export type UpdateJobInput = z.input<typeof updateJobSchema>;
export type DeleteJobInput = z.input<typeof deleteJobSchema>;
export type CloseJobInput = z.input<typeof closeJobSchema>;

export type JobRow = z.output<typeof jobRowSchema>;
export type CreateJobResult = CreateJobResultOutput;
export type UpdateJobResult = UpdateJobResultOutput;
export type DeleteJobResult = DeleteJobResultOutput;
export type CloseJobResult = CloseJobResultOutput;

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const jobRowSchema = z.object({
  jobListingId: z.number().int(),
  employerId: z.number().int(),
  title: z.string(),
  description: z.string(),
  requirements: z.string().nullable(),
  location: z.string().nullable(),
  employmentType: z.string().nullable(),
  salaryRange: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type JobRowOutput = z.output<typeof jobRowSchema>;

export const listJobsResultSchema = z.object({
  items: z.array(jobRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListJobsResult = z.output<typeof listJobsResultSchema>;

export const getJobResultSchema = z.union([jobRowSchema, z.null()]);

export type GetJobResult = z.output<typeof getJobResultSchema>;

export const createJobResultSchema = z.object({
  success: z.literal(true),
  jobListingId: z.number().int().positive(),
});

export type CreateJobResultOutput = z.output<typeof createJobResultSchema>;

export const updateJobResultSchema = z.object({
  success: z.literal(true),
});

export type UpdateJobResultOutput = z.output<typeof updateJobResultSchema>;

export const deleteJobResultSchema = z.object({
  success: z.literal(true),
});

export const closeJobResultSchema = z.object({
  success: z.literal(true),
});

export type DeleteJobResultOutput = z.output<typeof deleteJobResultSchema>;
export type CloseJobResultOutput = z.output<typeof closeJobResultSchema>;

export const getMyEmployerIdResultSchema = z.number().int().positive().nullable();

export const searchJobsResultSchema = z.object({
  query: z.string(),
  page: z.number().int().positive(),
  matchingCount: z.number().int().nonnegative(),
  rows: z.array(z.object({
    jobListingId: z.number().int(),
    title: z.string(),
    description: z.string(),
    location: z.string().nullable(),
    employmentType: z.string().nullable(),
    salaryRange: z.string().nullable(),
    status: z.string().nullable(),
    companyName: z.string(),
    createdAt: z.string(),
    score: z.number().optional(),
  })),
  source: z.object({
    current: z.string(),
    target: z.string(),
  }),
});
