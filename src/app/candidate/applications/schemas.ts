import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas for candidate/applications actions
// ---------------------------------------------------------------------------

export const applicationItemSchema = z.object({
  applicationId: z.number(),
  jobListingId: z.number(),
  jobTitle: z.string(),
  employerName: z.string(),
  status: z.string(),
  coverLetter: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
