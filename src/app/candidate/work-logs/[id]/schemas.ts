import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/work-logs/[id] actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const getCandidateWorkLogDetailSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

export const approveWorkLogAppealSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
});

export const rejectWorkLogAppealSchema = z.object({
  appealUuid: z.string().min(1, "Appeal UUID is required"),
  reason: z.string().min(1, "Rejection reason is required").max(1000),
});

/**
 * Update a work log — validates the UUID, status, and optional note.
 */
export const updateWorkLogSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
  status: z.coerce.number().int().min(0, "Status must be 0 or greater"),
  note: z.string().max(1000).optional(),
});

/**
 * Delete a work log entry — validates the UUID.
 */
export const deleteWorkLogSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetCandidateWorkLogDetailInput = z.input<typeof getCandidateWorkLogDetailSchema>;
export type ApproveWorkLogAppealInput = z.input<typeof approveWorkLogAppealSchema>;
export type RejectWorkLogAppealInput = z.input<typeof rejectWorkLogAppealSchema>;
export type UpdateWorkLogInput = z.input<typeof updateWorkLogSchema>;
export type DeleteWorkLogInput = z.input<typeof deleteWorkLogSchema>;

export type WorkLogAppealDetail = {
  appeal_uuid: string;
  candidate_working_hour_uuid: string;
  candidate_id: number;
  reason: string | null;
  status: number;
  created_at: Date | null;
  updated_at: Date | null;
};

export type WorkLogDetailForAppeal = {
  candidate_working_hour_uuid: string;
  date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  via: string | null;
  note: string | null;
  store_name: string | null;
  store_location: string | null;
  company_name: string | null;
};

// ---------------------------------------------------------------------------
// Work log appeals (migrated from direct prisma in page.tsx)
// ---------------------------------------------------------------------------

export const getWorkLogAppealsSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

export type GetWorkLogAppealsInput = z.input<typeof getWorkLogAppealsSchema>;

export type WorkLogAppealRow = {
  appeal_uuid: string;
  reason: string | null;
  status: number | null;
  created_at: Date | null;
};

// ---------------------------------------------------------------------------
// Work log feedback (migrated from direct prisma in page.tsx)
// ---------------------------------------------------------------------------

export const getWorkLogFeedbackSchema = z.object({
  workLogUuid: z.string().min(1, "Work log UUID is required"),
});

export type GetWorkLogFeedbackInput = z.input<typeof getWorkLogFeedbackSchema>;

export type WorkLogFeedbackRow = {
  cwlf_uuid: string;
  note: string | null;
  reason: string | null;
  status: number | null;
  rating: boolean | null;
  created_at: Date | null;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const workLogDetailForAppealOutputSchema = z.object({
  candidate_working_hour_uuid: z.string(),
  date: z.date().nullable(),
  start_time: z.date().nullable(),
  end_time: z.date().nullable(),
  total_time: z.number().nullable(),
  status: z.number().nullable(),
  via: z.string().nullable(),
  note: z.string().nullable(),
  store_name: z.string().nullable(),
  store_location: z.string().nullable(),
  company_name: z.string().nullable(),
});

export const workLogAppealRowOutputSchema = z.object({
  appeal_uuid: z.string(),
  reason: z.string().nullable(),
  status: z.number().nullable(),
  created_at: z.date().nullable(),
});

export const workLogFeedbackRowOutputSchema = z.object({
  cwlf_uuid: z.string(),
  note: z.string().nullable(),
  reason: z.string().nullable(),
  status: z.number().nullable(),
  rating: z.boolean().nullable(),
  created_at: z.date().nullable(),
});

export const workLogActionOutputSchema = z.object({
  appeal_uuid: z.string(),
});

export const workLogUpdateOutputSchema = z.object({
  workLogUuid: z.string(),
});
