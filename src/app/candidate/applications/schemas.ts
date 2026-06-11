import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas for candidate/applications actions
// ---------------------------------------------------------------------------

export const listApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().optional(),
});

export type ListApplicationsInput = z.input<typeof listApplicationsSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const applicationItemSchema = z.object({
  applicationId: z.number(),
  jobListingId: z.number(),
  jobTitle: z.string(),
  employerName: z.string(),
  status: z.string(),
  coverLetter: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
});

export type ApplicationItem = z.output<typeof applicationItemSchema>;

export const listApplicationsResultSchema = z.object({
  applications: z.array(applicationItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type ListApplicationsResult = z.output<typeof listApplicationsResultSchema>;

export const withdrawApplicationResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export type WithdrawApplicationResult = z.output<typeof withdrawApplicationResultSchema>;
