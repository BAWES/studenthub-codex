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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListJobsInput = z.input<typeof listJobsSchema>;
export type GetJobInput = z.input<typeof getJobSchema>;
export type CreateJobInput = z.input<typeof createJobSchema>;
export type UpdateJobInput = z.input<typeof updateJobSchema>;
export type DeleteJobInput = z.input<typeof deleteJobSchema>;

export type JobRow = {
  jobListingId: number;
  employerId: number;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  employmentType: string | null;
  salaryRange: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateJobResult = {
  success: true;
  jobListingId: number;
};

export type UpdateJobResult = {
  success: true;
};

export type DeleteJobResult = {
  success: true;
};
