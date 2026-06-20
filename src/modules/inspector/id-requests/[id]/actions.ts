"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  updateIdRequestStatusSchema,
  type UpdateIdRequestStatusInput,
  type GetIdRequestInput,
} from "../schemas";
import type { IdRequestDetail } from "../schemas";
import { getIdRequest as _getIdRequest } from "../actions";
import { inspectorIdRequestActionResultSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Re-export detail query from parent (detail page uses the same model)
// Next.js 15 "use server" forbids bare re-exports — use wrapper function.
// ---------------------------------------------------------------------------

export async function getIdRequest(
  params: GetIdRequestInput,
): Promise<IdRequestDetail | null> {
  return _getIdRequest(params);
}

// ---------------------------------------------------------------------------
// updateIdRequestStatus — update the status of a candidate ID verification
// ---------------------------------------------------------------------------

/**
 * Update the status of a candidate ID verification request.
 * Accepted transitions: pending → approved, pending → rejected.
 * When rejecting, a rejection_reason (10–500 chars) is required.
 * Revalidates both the detail page and the list page.
 */
export async function updateIdRequestStatus(
  params: UpdateIdRequestStatusInput,
): Promise<{ success: true } | { error: string }> {
  await requireCapability("id_review.mutate");

  const parsed = updateIdRequestStatusSchema.safeParse(params);
  if (!parsed.success) {
    const result = {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
    const outputParsed = inspectorIdRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  const { id, status, rejection_reason } = parsed.data;

  const existing = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: id },
    select: { cir_uuid: true, status: true },
  });

  if (!existing) {
    const result = { error: "ID request not found." };
    const outputParsed = inspectorIdRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  if (existing.status !== "pending") {
    const result = {
      error: `Cannot update a request with status "${existing.status}". Only 'pending' requests can be updated.`,
    };
    const outputParsed = inspectorIdRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  if (status === "rejected" && !rejection_reason) {
    const result = {
      error:
        "Rejection reason is required when rejecting an ID verification request.",
    };
    const outputParsed = inspectorIdRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  await prisma.candidate_id_request.update({
    where: { cir_uuid: id },
    data: {
      status,
      ...(rejection_reason ? { rejection_reason } : {}),
      updated_at: new Date(),
    },
  });

  revalidatePath(`/inspector/id-requests/${id}`);
  revalidatePath("/inspector/id-requests");

  const result = { success: true } as const;
  const outputParsed = inspectorIdRequestActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// Form-action helpers
// ---------------------------------------------------------------------------

const formActionRejectSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required."),
  reason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters.")
    .max(500, "Rejection reason must be under 500 characters."),
});

function parseCandidateIdList(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

/**
 * Approve an ID verification request.
 * Form-action compatible — accepts (prevState, formData) signature.
 * Creates candidate notifications for all candidates in the batch.
 * Redirects to the detail page with a success notice.
 */
export async function approveIdRequest(
  _prevState: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  await requireCapability("id_review.mutate");
  const requestUuid = formData.get("requestUuid");

  if (typeof requestUuid !== "string" || !requestUuid.trim()) {
    return { error: "Invalid request." };
  }

  const request = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: requestUuid },
    select: { cir_uuid: true, status: true, candidate_ids: true },
  });

  if (!request) return { error: "ID request not found." };
  if (request.status !== "pending")
    return { error: "This request can only be processed from 'pending' status." };

  const session = await requireCapability("id_review.mutate");
  const staffId = Number(session.id);
  const now = new Date();

  await prisma.candidate_id_request.update({
    where: { cir_uuid: requestUuid },
    data: {
      status: "approved",
      updated_by: staffId,
      updated_at: now,
    },
  });

  const candidateIds = parseCandidateIdList(request.candidate_ids);
  if (candidateIds.length > 0) {
    await prisma.candidate_notification.createMany({
      data: candidateIds.map((candidateId) => ({
        cn_uuid: crypto.randomUUID(),
        candidate_id: candidateId,
        type: 50,
        staff_id: staffId,
        message: "Your ID verification request has been approved.",
        is_new: true,
        created_at: now,
        updated_at: now,
      })),
    });
  }

  revalidatePath(`/inspector/id-requests/${requestUuid}`);
  revalidatePath("/inspector/id-requests");
  redirect(`/inspector/id-requests/${requestUuid}?notice=id-request-approved`);
}

/**
 * Reject an ID verification request with a required reason.
 * Form-action compatible — accepts (prevState, formData) signature.
 * Creates candidate notifications for all candidates in the batch.
 * Redirects to the detail page with a success notice.
 */
export async function rejectIdRequest(
  _prevState: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  await requireCapability("id_review.mutate");
  const requestUuid = formData.get("requestUuid");
  const reason = formData.get("reason");

  const parsed = formActionRejectSchema.safeParse({ requestUuid, reason });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const request = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: parsed.data.requestUuid },
    select: { cir_uuid: true, status: true, candidate_ids: true },
  });

  if (!request) return { error: "ID request not found." };
  if (request.status !== "pending")
    return { error: "This request can only be processed from 'pending' status." };

  const session = await requireCapability("id_review.mutate");
  const staffId = Number(session.id);
  const now = new Date();

  await prisma.candidate_id_request.update({
    where: { cir_uuid: parsed.data.requestUuid },
    data: {
      status: "rejected",
      rejection_reason: parsed.data.reason,
      updated_by: staffId,
      updated_at: now,
    },
  });

  const candidateIds = parseCandidateIdList(request.candidate_ids);
  if (candidateIds.length > 0) {
    await prisma.candidate_notification.createMany({
      data: candidateIds.map((candidateId) => ({
        cn_uuid: crypto.randomUUID(),
        candidate_id: candidateId,
        type: 50,
        staff_id: staffId,
        message: `Your ID verification request has been rejected. Reason: ${parsed.data.reason}`,
        is_new: true,
        created_at: now,
        updated_at: now,
      })),
    });
  }

  revalidatePath(`/inspector/id-requests/${requestUuid}`);
  revalidatePath("/inspector/id-requests");
  redirect(`/inspector/id-requests/${requestUuid}?notice=id-request-rejected`);
}
