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
