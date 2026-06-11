import { z } from "zod";

// ---------------------------------------------------------------------------
// Employer Dashboard — type definitions
// Provides stats summary, recent applications, and job listing counts
// for the employer/company role dashboard view.
// ---------------------------------------------------------------------------

export type EmployerDashboardMetric = {
  label: string;
  value: number;
  note: string;
};

export type RecentApplication = {
  applicationId: number;
  candidateId: number;
  candidateName: string | null;
  jobTitle: string;
  jobListingId: number;
  status: string;
  createdAt: Date;
};

export type JobStatusBreakdown = {
  status: string;
  count: number;
};

export type EmployerDashboardData = {
  metrics: EmployerDashboardMetric[];
  recentApplications: RecentApplication[];
  jobStatusBreakdown: JobStatusBreakdown[];
  totalJobs: number;
  totalApplications: number;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single dashboard metric.
 */
export const employerDashboardMetricOutputSchema = z.object({
  label: z.string(),
  value: z.number(),
  note: z.string(),
});

/**
 * Schema for a recent application entry.
 */
export const recentApplicationOutputSchema = z.object({
  applicationId: z.number().int(),
  candidateId: z.number().int(),
  candidateName: z.string().nullable(),
  jobTitle: z.string(),
  jobListingId: z.number().int(),
  status: z.string(),
  createdAt: z.date(),
});

/**
 * Schema for a job status breakdown entry.
 */
export const jobStatusBreakdownOutputSchema = z.object({
  status: z.string(),
  count: z.number().int().nonnegative(),
});

/**
 * Schema for the full employer dashboard response.
 */
export const employerDashboardDataOutputSchema = z.object({
  metrics: z.array(employerDashboardMetricOutputSchema),
  recentApplications: z.array(recentApplicationOutputSchema),
  jobStatusBreakdown: z.array(jobStatusBreakdownOutputSchema),
  totalJobs: z.number().int().nonnegative(),
  totalApplications: z.number().int().nonnegative(),
});
