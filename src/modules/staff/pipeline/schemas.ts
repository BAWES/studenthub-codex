import { z } from "zod";

/** Pipeline stage values mapped from invitation_status */
export const pipelineStageSchema = z.enum([
  "pending_review",
  "interviewing",
  "offered",
  "hired",
  "rejected",
]);

export const updatePipelineStageSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
  stage: pipelineStageSchema,
});

export type UpdatePipelineStageInput = z.input<typeof updatePipelineStageSchema>;

export const pipelineStageLabel: Record<string, string> = {
  pending_review: "Pending Review",
  interviewing: "Interviewing",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

export const pipelineStageColor: Record<string, string> = {
  pending_review: "var(--amber-500, #f59e0b)",
  interviewing: "var(--blue-500, #3b82f6)",
  offered: "var(--emerald-500, #10b981)",
  hired: "var(--green-500, #22c55e)",
  rejected: "var(--slate-500, #64748b)",
};

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const pipelineItemSchema = z.object({
  id: z.string(),
  requestUuid: z.string(),
  candidateName: z.string(),
  candidateId: z.number().nullable(),
  positionTitle: z.string(),
  companyName: z.string(),
  stage: pipelineStageSchema,
  updatedAt: z.date(),
  priority: z.enum(["high", "normal", "low"]),
  invitationStatus: z.number(),
});

export const pipelineTrendSchema = z.object({
  direction: z.enum(["up", "down", "flat"]),
  label: z.string(),
});

export const pipelineMetricsSchema = z.object({
  pendingReview: z.number(),
  interviewing: z.number(),
  offered: z.number(),
  hired: z.number(),
  rejected: z.number(),
  total: z.number(),
  trends: z.object({
    pending_review: pipelineTrendSchema,
    interviewing: pipelineTrendSchema,
    offered: pipelineTrendSchema,
    hired: pipelineTrendSchema,
    rejected: pipelineTrendSchema,
  }),
});

export const updatePipelineStageResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  newStage: pipelineStageSchema.optional(),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type PipelineItem = z.output<typeof pipelineItemSchema>;
export type PipelineMetrics = z.output<typeof pipelineMetricsSchema>;
export type UpdatePipelineStageResult = z.output<typeof updatePipelineStageResultSchema>;
