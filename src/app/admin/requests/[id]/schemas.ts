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
// Output validation schemas
// ---------------------------------------------------------------------------

/** Schema for the request existence check result. */
export const requestExistenceSchema = z
  .object({
    request_uuid: z.string().min(1),
  })
  .nullable();

/** Schema for the addComment response. */
export const addCommentResultSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("success"), message: z.string() }),
  z.object({ operation: z.literal("error"), message: z.string() }),
]);

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
