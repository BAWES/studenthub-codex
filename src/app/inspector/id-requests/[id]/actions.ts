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
  await requireRoleCapability("inspector", "id_review.mutate");

  const parsed = updateIdRequestStatusSchema.safeParse(params);
  if (!parsed.success) {
    const result = {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
    const outputParsed = inspectorIdRequestActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[app/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
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
        "[app/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
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
        "[app/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
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
        "[app/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
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
      "[app/inspector/id-requests/[id]] updateIdRequestStatus output validation failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}
