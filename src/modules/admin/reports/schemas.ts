import { z } from "zod";

// ---------------------------------------------------------------------------
// Admin Reports — zod schemas
// ---------------------------------------------------------------------------

export const listReportsSchema = z.object({
  type: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().positive().optional().default(1),
});

export const getReportSchema = z.object({
  id: z.string().min(1, "Report ID is required"),
  type: z.string().min(1, "Report type is required"),
});

export const generateReportSchema = z.object({
  type: z.string().min(1, "Report type is required"),
  date: z.string().optional(),
  staffEmail: z.string().email().optional(),
  params: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single report type item from the static catalog.
 */
export const reportTypeItemSchema = z.object({
  type: z.string().min(1, "Report type is required"),
  label: z.string().min(1, "Label is required"),
  description: z.string().min(1, "Description is required"),
});

/**
 * Schema for the listReports response.
 */
export const listReportsResultSchema = z.object({
  reports: z.array(reportTypeItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
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
 * Schema for a single report result (getReport / generateReport data).
 */
export const singleReportSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  label: z.string().min(1),
  data: z.union([getRecruiterReportResultSchema, z.record(z.unknown())]),
  generatedAt: z.string().min(1),
});

/**
 * Schema for the generateReport response.
 */
export const generateReportResultSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string().min(1),
  data: singleReportSchema.optional(),
});

// ---------------------------------------------------------------------------
// Inferred output types
// ---------------------------------------------------------------------------

export type ReportTypeItem = z.output<typeof reportTypeItemSchema>;
export type RecruiterStaffReport = z.output<typeof recruiterStaffReportSchema>;
export type GetRecruiterReportResult = z.output<typeof getRecruiterReportResultSchema>;
export type ListReportsResult = z.output<typeof listReportsResultSchema>;
export type SingleReportResult = z.output<typeof singleReportSchema>;
export type GenerateReportResult = z.output<typeof generateReportResultSchema>;
