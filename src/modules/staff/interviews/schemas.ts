import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const VALID_INTERVIEW_STATUSES = [0, 1, 2] as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listStaffInterviewsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  status: z.number().int().refine((v) => [0, 1, 2].includes(v), {
    message: "Status must be 0 (scheduled), 1 (completed), or 2 (cancelled)",
  }).optional(),
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
  status: z.number().int().refine((v) => [0, 1, 2].includes(v), {
    message: "Status must be 0 (scheduled), 1 (completed), or 2 (cancelled)",
  }),
});

export type UpdateInterviewStatusInput = z.input<
  typeof updateInterviewStatusSchema
>;

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type InterviewRow = {
  id: string;
  candidate: string;
  candidateEmail: string;
  candidateId: number | null;
  requestTitle: string;
  requestUuid: string;
  scheduledAt: string;
  status: string;
  note: string;
};

export type InterviewDetail = {
  interviewUuid: string;
  candidateName: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;
  candidateId: number | null;
  requestTitle: string | null;
  requestUuid: string | null;
  companyName: string | null;
  scheduledAt: Date | null;
  status: number | null;
  interviewNote: string | null;
  note: string | null;
  staffName: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type UpdateInterviewStatusResult = {
  operation: "success" | "error";
  message: string;
};

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
