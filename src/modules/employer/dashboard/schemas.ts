import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const employerDashboardMetricSchema = z.object({
  label: z.string(),
  value: z.number(),
  note: z.string(),
});

export const recentApplicationSchema = z.object({
  applicationId: z.number(),
  candidateId: z.number(),
  candidateName: z.string().nullable(),
  jobTitle: z.string(),
  jobListingId: z.number(),
  status: z.string(),
  createdAt: z.date(),
});

export const jobStatusBreakdownSchema = z.object({
  status: z.string(),
  count: z.number(),
});

export const employerDashboardDataSchema = z.object({
  metrics: z.array(employerDashboardMetricSchema),
  recentApplications: z.array(recentApplicationSchema),
  jobStatusBreakdown: z.array(jobStatusBreakdownSchema),
  totalJobs: z.number(),
  totalApplications: z.number(),
  pendingReviews: z.number(),
});

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type EmployerDashboardMetric = z.output<typeof employerDashboardMetricSchema>;
export type RecentApplication = z.output<typeof recentApplicationSchema>;
export type JobStatusBreakdown = z.output<typeof jobStatusBreakdownSchema>;
export type EmployerDashboardData = z.output<typeof employerDashboardDataSchema>;
