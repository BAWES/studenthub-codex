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

export const reportTypeItemSchema = z.object({
  type: z.string().min(1, "Report type is required"),
  label: z.string().min(1, "Label is required"),
  description: z.string().min(1, "Description is required"),
});

export const listReportsResultSchema = z.object({
  reports: z.array(reportTypeItemSchema),
  total: z.number().int().nonnegative(),
});

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

export const getRecruiterReportResultSchema = z.object({
  date: z.string().min(1),
  reports: z.array(recruiterStaffReportSchema),
  total: z.number().int().nonnegative(),
});
