"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  updateIdRequestStatusSchema,
  type UpdateIdRequestStatusInput,
  type GetIdRequestInput,
} from "../schemas";
import type { IdRequestDetail } from "../schemas";
import { getIdRequest as _getIdRequest } from "../actions";

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
  await requireRoleCapability("inspector", "id_review.mutate");

  const parsed = updateIdRequestStatusSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { id, status, rejection_reason } = parsed.data;

  const existing = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: id },
    select: { cir_uuid: true, status: true },
  });

  if (!existing) {
    return { error: "ID request not found." };
  }

  if (existing.status !== "pending") {
    return {
      error: `Cannot update a request with status "${existing.status}". Only 'pending' requests can be updated.`,
    };
  }

  if (status === "rejected" && !rejection_reason) {
    return {
      error:
        "Rejection reason is required when rejecting an ID verification request.",
    };
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

  return { success: true };
}
