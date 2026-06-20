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

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/** Validates a route-level interview detail object. */
export const interviewDetailRouteOutputSchema = z.object({
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
  internalNote: z.string().nullable(),
  staffName: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

/** Validates the updateInterviewNotes return shape. */
export const updateInterviewNotesOutputSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
});
