import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const getRequestDetailSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
});

export const approveRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  reason: z.string().min(1, "Reason is required").max(500),
});

export const rejectRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  reason: z.string().min(1, "Reason is required").max(500),
});

export const addCommentSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  comment: z.string().min(1, "Comment is required").max(2000),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ApproveRequestInput = z.input<typeof approveRequestSchema>;
export type RejectRequestInput = z.input<typeof rejectRequestSchema>;
export type AddCommentInput = z.input<typeof addCommentSchema>;

export type AddCommentResponse = {
  operation: "success" | "error";
  message: string;
};
