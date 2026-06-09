import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getInterviewSchema = z.object({
  interviewUuid: z.string().min(1, "Interview UUID is required"),
});

export const updateInterviewNotesSchema = z.object({
  interviewUuid: z.string().min(1, "Interview UUID is required"),
  internalNote: z.string().optional(),
  interviewNote: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetInterviewInput = z.input<typeof getInterviewSchema>;

export type UpdateInterviewNotesInput = z.input<
  typeof updateInterviewNotesSchema
>;

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
  internalNote: string | null;
  staffName: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type UpdateInterviewNotesResult = {
  operation: "success" | "error";
  message: string;
};
