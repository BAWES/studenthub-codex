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
// Types
// ---------------------------------------------------------------------------

export type ListCandidateJobsInput = z.input<typeof listCandidateJobsSchema>;
export type GetCandidateJobInput = z.input<typeof getCandidateJobSchema>;
export type ApplyToJobInput = z.input<typeof applyToJobSchema>;
export type ListMyApplicationsInput = z.input<typeof listMyApplicationsSchema>;
export type ListJobApplicationsInput = z.input<typeof listJobApplicationsSchema>;

export type CandidateJobRow = {
  jobListingId: number;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  employmentType: string | null;
  salaryRange: string | null;
  employerName: string;
  matchScore: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CandidateJobDetail = CandidateJobRow & {
  status: string | null;
  hasApplied: boolean;
  applicationStatus: string | null;
};

export type ApplicationRow = {
  applicationId: number;
  jobListingId: number;
  jobTitle: string;
  employerName: string;
  status: string;
  coverLetter: string | null;
  createdAt: Date;
  updatedAt: Date;
};

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
