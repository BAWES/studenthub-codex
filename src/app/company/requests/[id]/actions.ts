"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  updateRequestStatusSchema,
  deleteRequestSchema,
  type UpdateRequestStatusInput,
  type DeleteRequestInput,
} from "../schemas";

// ---------------------------------------------------------------------------
// Re-export detail query from parent (detail page uses the same model)
// ---------------------------------------------------------------------------

export { getCompanyRequestDetail as getRequest } from "../actions";

// ---------------------------------------------------------------------------
// updateRequestStatus — update the status of a company request
// ---------------------------------------------------------------------------

/**
 * Update the status of a company request with optional feedback.
 * Mirrors the legacy RequestController::actionUpdateStatus().
 * Revalidates the detail and list pages.
 */
export async function updateRequestStatus(
  params: UpdateRequestStatusInput,
): Promise<{ success: true } | { error: string }> {
  await requireCapability("request.write");

  const parsed = updateRequestStatusSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { uuid, status, feedback } = parsed.data;

  const existing = await prisma.request.findUnique({
    where: { request_uuid: uuid },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    return { error: "Request not found." };
  }

  await prisma.request.update({
    where: { request_uuid: uuid },
    data: {
      request_status: status,
      ...(feedback !== undefined ? { request_feedback: feedback } : {}),
      request_updated_datetime: new Date(),
    },
  });

  revalidatePath(`/company/requests/${uuid}`);
  revalidatePath("/company/requests");

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteRequest — soft-delete / cancel a company request
// ---------------------------------------------------------------------------

/**
 * Cancel (soft-delete) a company request by setting status to "cancelled".
 * Revalidates the list page.
 */
export async function deleteRequest(
  params: DeleteRequestInput,
): Promise<{ success: true } | { error: string }> {
  await requireCapability("request.write");

  const parsed = deleteRequestSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { uuid } = parsed.data;

  const existing = await prisma.request.findUnique({
    where: { request_uuid: uuid },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    return { error: "Request not found." };
  }

  if (existing.request_status === "cancelled") {
    return { error: "Request is already cancelled." };
  }

  await prisma.request.update({
    where: { request_uuid: uuid },
    data: {
      request_status: "cancelled",
      request_cancelled_at: new Date(),
      request_updated_datetime: new Date(),
    },
  });

  revalidatePath("/company/requests");

  return { success: true };
}
