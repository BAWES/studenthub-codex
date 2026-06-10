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

export type UpdatePipelineStageInput = z.infer<typeof updatePipelineStageSchema>;

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
