"use server";

// ---------------------------------------------------------------------------
// Admin Request [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to the parent layer and add
// request-level comment support.
//
// Actions:
//   - getRequestDetail  — single request detail (delegates to shared module)
//   - approveRequest    — approve a pending request (delegates to parent)
//   - rejectRequest     — reject a request with reason (delegates to parent)
//   - addComment        — add an internal note to a request
// ---------------------------------------------------------------------------

import crypto from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { getRequestDetail as _getRequestDetail } from "@/modules/workspace/request-detail-core";
import {
  approveRequest as parentApproveRequest,
  rejectRequest as parentRejectRequest,
} from "@/modules/admin/requests/actions";
import {
  getRequestDetailSchema,
  approveRequestSchema,
  rejectRequestSchema,
  addCommentSchema,
  addCommentResultSchema,
  requestExistenceSchema,
} from "./schemas";
import type {
  ApproveRequestInput,
  RejectRequestInput,
  AddCommentInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Consumers import the types directly from ../schemas — see DESIGN.md.
// Type exports inside "use server" files are not allowed by Next.js 15.x.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getRequestDetail
// ---------------------------------------------------------------------------

/**
 * Get a single request with full pipeline detail (applications, interviews,
 * invitations, matched candidates, metrics, activities, stories, notes).
 *
 * Wraps the shared @/modules/workspace/data/shared getRequestDetail as a
 * route-level server action with admin-role auth.
 */
export async function getRequestDetail(
  requestUuid: string,
): Promise<Awaited<ReturnType<typeof _getRequestDetail>>> {
  await requireRoleCapability("admin", "request.read.any");

  const parsed = getRequestDetailSchema.safeParse({ requestUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request UUID");
  }

  return _getRequestDetail(parsed.data.requestUuid);
}

// ---------------------------------------------------------------------------
// approveRequest
// ---------------------------------------------------------------------------

/**
 * Approve a pending request. Delegates to the parent `approveRequest` action.
 */
export async function approveRequest(
  input: ApproveRequestInput,
): Promise<{ operation: "success" | "error"; message: string }> {
  await requireRoleCapability("admin", "request.write.any");

  const parsed = approveRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  return parentApproveRequest(parsed.data);
}

// ---------------------------------------------------------------------------
// rejectRequest
// ---------------------------------------------------------------------------

/**
 * Reject a request with a reason. Delegates to the parent `rejectRequest` action.
 */
export async function rejectRequest(
  input: RejectRequestInput,
): Promise<{ operation: "success" | "error"; message: string }> {
  await requireRoleCapability("admin", "request.write.any");

  const parsed = rejectRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  return parentRejectRequest(parsed.data);
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
): Promise<z.output<typeof addCommentResultSchema>> {
  await requireRoleCapability("admin", "request.write.any");

  const parsed = addCommentSchema.safeParse(input);
  if (!parsed.success) {
    return addCommentResultSchema.parse({
      operation: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  const { requestUuid, comment } = parsed.data;

  // Verify the request exists
  const existing = await prisma.request.findUnique({
    where: { request_uuid: requestUuid },
    select: { request_uuid: true },
  });

  const parsedExisting = requestExistenceSchema.safeParse(existing);
  if (!parsedExisting.success || !parsedExisting.data) {
    return addCommentResultSchema.parse({
      operation: "error" as const,
      message: "Request not found",
    });
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

    return addCommentResultSchema.parse({
      operation: "success" as const,
      message: "Comment added successfully",
    });
  } catch (err) {
    return addCommentResultSchema.parse({
      operation: "error" as const,
      message: err instanceof Error ? err.message : "Failed to add comment",
    });
  }
}
