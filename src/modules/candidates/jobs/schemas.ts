import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCandidateJobsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
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
  candidateId: z.number().int().positive("Candidate ID is required").optional(),
});

export const applyToJobSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  jobListingId: z.coerce.number().int().positive(),
  coverLetter: z.string().optional(),
});

export const listMyApplicationsSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

// Input types
export type ListCandidateJobsParams = z.input<typeof listCandidateJobsSchema>;
export type GetCandidateJobParams = z.input<typeof getCandidateJobSchema>;
export type ApplyToJobParams = z.input<typeof applyToJobSchema>;
export type ListMyApplicationsParams = z.input<typeof listMyApplicationsSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const candidateJobRowSchema = z.object({
  jobListingId: z.number().int(),
  title: z.string(),
  description: z.string(),
  requirements: z.string().nullable(),
  location: z.string().nullable(),
  employmentType: z.string().nullable(),
  salaryRange: z.string().nullable(),
  employerName: z.string(),
  matchScore: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const candidateJobDetailSchema = candidateJobRowSchema.extend({
  status: z.string().nullable(),
  hasApplied: z.boolean(),
  applicationStatus: z.string().nullable(),
  skillScore: z.number().nullable(),
  educationScore: z.number().nullable(),
  locationScore: z.number().nullable(),
  breakdown: z.array(z.string()),
});

export const applicationRowSchema = z.object({
  applicationId: z.number().int(),
  jobListingId: z.number().int(),
  jobTitle: z.string(),
  employerName: z.string(),
  status: z.string(),
  coverLetter: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const listJobsResultSchema = z.object({
  items: z.array(candidateJobRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const listApplicationsResultSchema = z.object({
  items: z.array(applicationRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const applyToJobResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), applicationId: z.number().int().positive() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const getCandidateJobResultSchema = z.object({
  job: candidateJobDetailSchema,
});

// Output types
export type CandidateJobRow = z.output<typeof candidateJobRowSchema>;
export type CandidateJobDetail = z.output<typeof candidateJobDetailSchema>;
export type ApplicationRow = z.output<typeof applicationRowSchema>;
export type ListJobsResult = z.output<typeof listJobsResultSchema>;
export type ListApplicationsResult = z.output<typeof listApplicationsResultSchema>;
export type ApplyToJobResult = z.output<typeof applyToJobResultSchema>;
