"use server";

// ---------------------------------------------------------------------------
// Admin Request [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to the parent layer and add
// request-level comment support.
//
// Actions:
//   - getRequestDetail  — single request detail (delegates to parent)
//   - approveRequest    — approve a pending request (delegates to parent)
//   - rejectRequest     — reject a request with reason (delegates to parent)
//   - addComment        — add an internal note to a request
// ---------------------------------------------------------------------------

import crypto from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  getRequest as parentGetRequest,
  approveRequest as parentApproveRequest,
  rejectRequest as parentRejectRequest,
} from "../actions";

// ---------------------------------------------------------------------------
// Re-export parent types so consumers have a single import path
// ---------------------------------------------------------------------------
export type {
  RequestDetail,
  RequestActionResponse,
} from "../actions";

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

export type AddCommentInput = z.input<typeof addCommentSchema>;

export type AddCommentResponse = {
  operation: "success" | "error";
  message: string;
};

// ---------------------------------------------------------------------------
// getRequestDetail
// ---------------------------------------------------------------------------

/**
 * Get a single request with full detail (applications, invitations,
 * interviews, metrics). Delegates to the parent `getRequest` action.
 */
export async function getRequestDetail(
  requestUuid: string,
): Promise<import("../actions").RequestDetail> {
  return parentGetRequest(requestUuid);
}

// ---------------------------------------------------------------------------
// approveRequest
// ---------------------------------------------------------------------------

/**
 * Approve a pending request. Delegates to the parent `approveRequest` action.
 */
export async function approveRequest(
  input: z.input<typeof approveRequestSchema>,
): Promise<import("../actions").RequestActionResponse> {
  return parentApproveRequest(input);
}

// ---------------------------------------------------------------------------
// rejectRequest
// ---------------------------------------------------------------------------

/**
 * Reject a request with a reason. Delegates to the parent `rejectRequest` action.
 */
export async function rejectRequest(
  input: z.input<typeof rejectRequestSchema>,
): Promise<import("../actions").RequestActionResponse> {
  return parentRejectRequest(input);
}

// ---------------------------------------------------------------------------
// addComment
// ---------------------------------------------------------------------------

/**
 * Add an internal note (comment) to a request.
 *
 * Creates a `note` record linked to the request via request_uuid.
 * Comments are visible on the request detail page under the activity feed.
 */
export async function addComment(
  input: AddCommentInput,
): Promise<AddCommentResponse> {
  await requireCapability("request.write.any");

  const parsed = addCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { requestUuid, comment } = parsed.data;

  // Verify the request exists
  const existing = await prisma.request.findUnique({
    where: { request_uuid: requestUuid },
    select: { request_uuid: true },
  });

  if (!existing) {
    return { operation: "error", message: "Request not found" };
  }

  const now = new Date();

  try {
    await prisma.note.create({
      data: {
        note_uuid: `note_${crypto.randomUUID()}`,
        request_uuid: requestUuid,
        note_type: "Internal Note",
        note_text: comment,
        note_created_datetime: now,
        note_updated_datetime: now,
      },
    });

    revalidatePath(`/admin/requests/${requestUuid}`);

    return {
      operation: "success",
      message: "Comment added successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to add comment",
    };
  }
}
