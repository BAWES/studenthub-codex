import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const createWorklogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM").optional().or(z.literal("")),
  note: z.string().max(500, "Note must be 500 characters or less").optional().or(z.literal("")),
});

export const listWorklogsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().or(z.literal("")),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional().or(z.literal("")),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional().or(z.literal("")),
});

export const updateWorklogSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM").optional(),
  note: z.string().max(500, "Note must be 500 characters or less").optional(),
});

export const deleteWorklogSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
});

export const updateWorklogStatusSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
  status: z.number().int(),
});

export type UpdateWorklogStatusInput = z.input<typeof updateWorklogStatusSchema>;

export const appealWorklogSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(1000, "Reason must be 1000 characters or less"),
});

export const getWorklogSchema = z.object({
  worklogUuid: z.string().min(1, "Work log UUID is required"),
});

export const getWorklogStatsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export const getWorkingDatesSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional().or(z.literal("")),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional().or(z.literal("")),
});

export const getAppealDetailSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
});

export const markAppealUpdateReadSchema = z.object({
  appealUpdateUuid: z.string().min(1, "Appeal update UUID is required"),
});

// Input types
export type CreateWorklogInput = z.input<typeof createWorklogSchema>;
export type ListWorklogsInput = z.input<typeof listWorklogsSchema>;
export type UpdateWorklogInput = z.input<typeof updateWorklogSchema>;
export type DeleteWorklogInput = z.input<typeof deleteWorklogSchema>;
export type AppealWorklogInput = z.input<typeof appealWorklogSchema>;
export type GetWorklogInput = z.input<typeof getWorklogSchema>;
export type GetWorklogStatsInput = z.input<typeof getWorklogStatsSchema>;
export type GetWorkingDatesInput = z.input<typeof getWorkingDatesSchema>;
export type GetAppealDetailInput = z.input<typeof getAppealDetailSchema>;
export type MarkAppealUpdateReadInput = z.input<typeof markAppealUpdateReadSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const worklogRowSchema = z.object({
  uuid: z.string(),
  date: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  totalTime: z.number().nullable(),
  note: z.string().nullable(),
  status: z.number(),
  via: z.string().nullable(),
  storeId: z.number().nullable(),
});

export const worklogStatsSchema = z.object({
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  totalTime: z.number().nullable(),
  status: z.number().nullable(),
});

export const workingDateSchema = z.object({
  date: z.string(),
  totalTime: z.number().nullable(),
});

export const appealDetailSchema = z.object({
  appealUuid: z.string(),
  worklogUuid: z.string(),
  reason: z.string().nullable(),
  status: z.number(),
  createdAt: z.string(),
});

export const listWorklogsResultSchema = z.object({
  worklogs: z.array(worklogRowSchema),
  error: z.string().optional(),
});

export const getWorklogResultSchema = z.object({
  worklog: worklogRowSchema.nullable(),
  error: z.string().optional(),
});

export const getWorklogStatsResultSchema = z.object({
  stats: worklogStatsSchema.nullable(),
  error: z.string().optional(),
});

export const getWorkingDatesResultSchema = z.object({
  dates: z.array(workingDateSchema),
  error: z.string().optional(),
});

export const getAppealDetailResultSchema = z.object({
  appeal: appealDetailSchema.nullable(),
  error: z.string().optional(),
});

export const worklogStateSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export const markAppealUpdateReadStateSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// Output types
export type WorklogRow = z.output<typeof worklogRowSchema>;
export type WorklogStats = z.output<typeof worklogStatsSchema>;
export type WorkingDate = z.output<typeof workingDateSchema>;
export type AppealDetail = z.output<typeof appealDetailSchema>;
export type ListWorklogsResult = z.output<typeof listWorklogsResultSchema>;
export type GetWorklogResult = z.output<typeof getWorklogResultSchema>;
export type GetWorklogStatsResult = z.output<typeof getWorklogStatsSchema>;
export type GetWorkingDatesResult = z.output<typeof getWorkingDatesResultSchema>;
export type GetAppealDetailResult = z.output<typeof getAppealDetailResultSchema>;
export type WorklogState = z.output<typeof worklogStateSchema>;
export type MarkAppealUpdateReadState = z.output<typeof markAppealUpdateReadStateSchema>;
