import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listQuestionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getSessionSchema = z.object({});

export const createAbsenceSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
  note: z.string().optional(),
  type: z.string().min(1, "Type is required"),
});

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type ListQuestionsParams = z.input<typeof listQuestionsSchema>;
export type GetSessionParams = z.input<typeof getSessionSchema>;
export type CreateAbsenceParams = z.input<typeof createAbsenceSchema>;

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const dailyStandupQuestionItemSchema = z.object({
  question_uuid: z.string(),
  question: z.string().nullable(),
});

export const listQuestionsResultSchema = z.object({
  questions: z.array(dailyStandupQuestionItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const workSessionItemSchema = z.object({
  work_session_uuid: z.string(),
  staff_id: z.number().nullable(),
  total_minutes: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const leaveItemSchema = z.object({
  staff_leave_uuid: z.string(),
  staff_id: z.number().nullable(),
  from_date: z.string().nullable(),
  to_date: z.string().nullable(),
  note: z.string().nullable(),
  category: z.string().nullable(),
  status: z.number().nullable(),
});

export const getSessionResultSchema = z.object({
  session: workSessionItemSchema.nullable(),
  leave: leaveItemSchema.nullable(),
});

export const createAbsenceResultSchema = z.object({
  staff_leave_uuid: z.string(),
});

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type DailyStandupQuestionItem = z.output<typeof dailyStandupQuestionItemSchema>;
export type ListQuestionsResult = z.output<typeof listQuestionsResultSchema>;
export type WorkSessionItem = z.output<typeof workSessionItemSchema>;
export type LeaveItem = z.output<typeof leaveItemSchema>;
export type GetSessionResult = z.output<typeof getSessionResultSchema>;
export type CreateAbsenceResult = z.output<typeof createAbsenceResultSchema>;
