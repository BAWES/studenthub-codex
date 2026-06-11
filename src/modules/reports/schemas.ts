import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listReportsSchema = z.object({
  type: z.string().optional(),
  date: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getRecruiterReportSchema = z.object({
  date: z.string().optional(),
  staffEmail: z.string().email().optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a report type item.
 */
export const reportTypeItemSchema = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string(),
});

/**
 * Schema for a single recruiter staff report row.
 */
export const recruiterStaffReportSchema = z.object({
  staffEmail: z.string(),
  staffName: z.string(),
  totalAssigned: z.number().int().nonnegative(),
  totalRequests: z.number().int().nonnegative(),
  totalNotes: z.number().int().nonnegative(),
  totalStories: z.number().int().nonnegative(),
  totalAcceptedInvitations: z.number().int().nonnegative(),
  totalRejectedInvitations: z.number().int().nonnegative(),
  totalSuggestions: z.number().int().nonnegative(),
  totalInvitations: z.number().int().nonnegative(),
  totalCompletedStories: z.number().int().nonnegative(),
});

/**
 * Schema for the listReports response.
 */
export const listReportsResultSchema = z.object({
  reports: z.array(reportTypeItemSchema),
  total: z.number().int().nonnegative(),
});

/**
 * Schema for the getRecruiterReport response.
 */
export const getRecruiterReportResultSchema = z.object({
  date: z.string(),
  reports: z.array(recruiterStaffReportSchema),
  total: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportTypeItem = z.output<typeof reportTypeItemSchema>;
export type RecruiterStaffReport = z.output<typeof recruiterStaffReportSchema>;
export type ListReportsResult = z.output<typeof listReportsResultSchema>;
export type GetRecruiterReportResult = z.output<
  typeof getRecruiterReportResultSchema
>;
