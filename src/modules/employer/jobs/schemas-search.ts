import { z } from "zod";

// ---------------------------------------------------------------------------
// Employer Jobs Search — schemas
// ---------------------------------------------------------------------------

export const searchJobsSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

export type SearchJobsInput = z.input<typeof searchJobsSchema>;

// ---------------------------------------------------------------------------
// Search result row
// ---------------------------------------------------------------------------

export const searchJobsRowSchema = z.object({
  jobListingId: z.number().int(),
  title: z.string(),
  description: z.string(),
  requirements: z.string().nullable(),
  location: z.string().nullable(),
  employmentType: z.string().nullable(),
  salaryRange: z.string().nullable(),
  status: z.string().nullable(),
  companyName: z.string(),
  createdAt: z.string(),
  score: z.number().optional(),
});

export type SearchJobsRow = z.output<typeof searchJobsRowSchema>;

// ---------------------------------------------------------------------------
// Source info
// ---------------------------------------------------------------------------

export const sourceInfoSchema = z.object({
  current: z.string(),
  target: z.string(),
});

export type SourceInfo = z.output<typeof sourceInfoSchema>;

// ---------------------------------------------------------------------------
// Search result
// ---------------------------------------------------------------------------

export const searchJobsResultSchema = z.object({
  query: z.string(),
  page: z.number().int(),
  matchingCount: z.number().int(),
  rows: z.array(searchJobsRowSchema),
  source: sourceInfoSchema,
});

export type SearchJobsResult = z.output<typeof searchJobsResultSchema>;
