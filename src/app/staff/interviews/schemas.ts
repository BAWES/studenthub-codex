import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const VALID_INTERVIEW_STATUSES = ["0", "1", "2"] as const;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listStaffInterviewsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(VALID_INTERVIEW_STATUSES).optional(),
  q: z.string().optional(),
});

export const getStaffInterviewDetailSchema = z.object({
  interviewUuid: z.string().min(1, "Interview UUID is required"),
});

export const updateInterviewStatusSchema = z.object({
  interviewUuid: z.string().min(1, "Interview UUID is required"),
  status: z.enum(VALID_INTERVIEW_STATUSES, {
    errorMap: () => ({
      message: `Status must be one of: ${VALID_INTERVIEW_STATUSES.join(", ")}`,
    }),
  }),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListStaffInterviewsInput = z.input<typeof listStaffInterviewsSchema>;
export type GetStaffInterviewDetailInput = z.input<
  typeof getStaffInterviewDetailSchema
>;
export type UpdateInterviewStatusInput = z.input<
  typeof updateInterviewStatusSchema
>;

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
