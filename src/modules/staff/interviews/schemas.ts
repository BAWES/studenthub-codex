import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const VALID_INTERVIEW_STATUSES = ["0", "1", "2"] as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listStaffInterviewsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(VALID_INTERVIEW_STATUSES).optional(),
  q: z.string().optional(),
});

export type ListStaffInterviewsInput = z.input<typeof listStaffInterviewsSchema>;

export const getStaffInterviewDetailSchema = z.object({
  interviewUuid: z.string().min(1, "Interview UUID is required"),
});

export type GetStaffInterviewDetailInput = z.input<
  typeof getStaffInterviewDetailSchema
>;

export const updateInterviewStatusSchema = z.object({
  interviewUuid: z.string().min(1, "Interview UUID is required"),
  status: z.enum(VALID_INTERVIEW_STATUSES, {
    errorMap: () => ({
      message: `Status must be one of: ${VALID_INTERVIEW_STATUSES.join(", ")}`,
    }),
  }),
});

export type UpdateInterviewStatusInput = z.input<
  typeof updateInterviewStatusSchema
>;

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type InterviewRow = z.output<typeof interviewRowOutputSchema>;
export type InterviewDetail = z.output<typeof interviewDetailOutputSchema>;
export type UpdateInterviewStatusResult = z.output<typeof updateInterviewStatusOutputSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const interviewRowOutputSchema = z.object({
  id: z.string(),
  candidate: z.string(),
  candidateEmail: z.string(),
  candidateId: z.number().int().nullable(),
  requestTitle: z.string(),
  requestUuid: z.string(),
  scheduledAt: z.string(),
  status: z.string(),
  note: z.string(),
});

export const interviewListOutputSchema = z.object({
  items: z.array(interviewRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const interviewDetailOutputSchema = z.object({
  interviewUuid: z.string(),
  candidateName: z.string().nullable(),
  candidateEmail: z.string().nullable(),
  candidatePhone: z.string().nullable(),
  candidateId: z.number().int().nullable(),
  requestTitle: z.string().nullable(),
  requestUuid: z.string().nullable(),
  companyName: z.string().nullable(),
  scheduledAt: z.date().nullable(),
  status: z.number().int().nullable(),
  interviewNote: z.string().nullable(),
  note: z.string().nullable(),
  staffName: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const updateInterviewStatusOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});

// ---------------------------------------------------------------------------
// updateInterviewNotes
// ---------------------------------------------------------------------------

export const updateInterviewNotesSchema = z.object({
  interviewUuid: z.string().min(1, "Interview UUID is required"),
  internalNote: z.string().optional(),
  interviewNote: z.string().optional(),
});

export type UpdateInterviewNotesInput = z.input<typeof updateInterviewNotesSchema>;

export type UpdateInterviewNotesResult = z.output<typeof updateInterviewNotesOutputSchema>;

export const updateInterviewNotesOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});
