import { z } from "zod";

// -----------------------------------------------------------------------
// Schemas — candidate job browsing and applications
// -----------------------------------------------------------------------

export const listCandidateJobsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  employmentType: z.string().optional(),
  location: z.string().optional(),
});

export const getCandidateJobSchema = z.object({
  jobId: z.coerce.number().int().positive("Job ID is required"),
});

export const applyToJobSchema = z.object({
  jobId: z.coerce.number().int().positive(),
  coverLetter: z.string().max(5000).optional(),
});

export const listMyApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type ListCandidateJobsInput = z.input<typeof listCandidateJobsSchema>;
export type GetCandidateJobInput = z.input<typeof getCandidateJobSchema>;
export type ApplyToJobInput = z.input<typeof applyToJobSchema>;
export type ListMyApplicationsInput = z.input<typeof listMyApplicationsSchema>;

export type CandidateJobRow = {
  jobListingId: number;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  employmentType: string | null;
  salaryRange: string | null;
  employerName: string | null;
  createdAt: Date;
};

export type ApplicationRow = {
  id: number;
  jobListingId: number;
  jobTitle: string;
  employerName: string | null;
  location: string | null;
  employmentType: string | null;
  salaryRange: string | null;
  status: string;
  coverLetter: string | null;
  appliedAt: Date;
};

export type ApplyToJobResult = {
  success: boolean;
  applicationId?: number;
  error?: string;
};

export type EmployerApplicationRow = {
  id: number;
  candidateId: number;
  candidateName: string | null;
  candidateEmail: string | null;
  status: string;
  coverLetter: string | null;
  appliedAt: Date;
};
