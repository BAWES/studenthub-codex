import { z } from "zod";

// ---------------------------------------------------------------------------
// Report Detail schemas — single report detail page
// ---------------------------------------------------------------------------

/**
 * Input schema for getReport.
 */
export const getReportSchema = z.object({
  id: z.string().min(1, "Report ID is required"),
  type: z.string().min(1, "Report type is required"),
});

/**
 * Schema for a single recruiter staff report row.
 */
export const recruiterStaffReportSchema = z.object({
  staffEmail: z.string().min(1),
  staffName: z.string().min(1),
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
 * Schema for the data field of a recruiter-daily report.
 */
export const getRecruiterReportResultSchema = z.object({
  date: z.string().min(1),
  reports: z.array(recruiterStaffReportSchema),
  total: z.number().int().nonnegative(),
});

/**
 * Schema for a single report result (getReport output).
 */
export const singleReportSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  label: z.string().min(1),
  data: z.union([getRecruiterReportResultSchema, z.record(z.unknown())]),
  generatedAt: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type RecruiterStaffReport = z.output<typeof recruiterStaffReportSchema>;
export type GetRecruiterReportResult = z.output<typeof getRecruiterReportResultSchema>;
export type SingleReportResult = z.output<typeof singleReportSchema>;
export type GetReportInput = z.input<typeof getReportSchema>;
