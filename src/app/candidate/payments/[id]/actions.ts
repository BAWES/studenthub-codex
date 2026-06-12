"use server";

// ---------------------------------------------------------------------------
// Candidate Payments [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to the parent list-level actions.
//
// Actions:
//   - getPayment         — fetch single payment detail by tc_id
//   - deletePayment      — soft-delete a payment record
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidatePaymentDetail as parentGetPaymentDetail,
  createCandidatePayment as parentCreatePayment,
} from "../actions";

import { z } from "zod";
import {
  getPaymentSchema,
  deletePaymentSchema,
  paymentActionResultSchema,
  paymentExistenceSchema,
} from "./schemas";
import type {
  GetPaymentParams,
  DeletePaymentParams,
} from "./schemas";

// ---------------------------------------------------------------------------
// getPayment
// ---------------------------------------------------------------------------

/**
 * Get a single payment detail with full info (transfer, company, invoices).
 * Delegates to the parent `getCandidatePaymentDetail` action.
 */
export async function getPayment(
  tcId: number,
): Promise<import("../schemas").GetPaymentDetailResult | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getPaymentSchema.safeParse({ tcId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid payment ID");
  }

  return parentGetPaymentDetail({ tcId: parsed.data.tcId });
}

// ---------------------------------------------------------------------------
// deletePayment
// ---------------------------------------------------------------------------

/**
 * Soft-delete a payment record by tc_id.
 * Only the owning candidate can delete their own payment records.
 *
 * Uses soft delete (sets deleted=1) following the existing pattern in
 * the parent list actions (where deleted=0 filters out soft-deleted rows).
 *
 * Returns `{ success: true }` on success, `{ success: false, error }` on error.
 */
export async function deletePayment(
  tcId: number,
): Promise<z.infer<typeof paymentActionResultSchema>> {
  try {
    const session = await requireRoleCapability("candidate", "candidate.profile.edit");

    const parsed = deletePaymentSchema.safeParse({ tcId });
    if (!parsed.success) {
      return paymentActionResultSchema.parse({
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid payment ID",
      });
    }

    const candidateId = Number(session.id);

    // Verify ownership before soft-deleting
    const existing = await prisma.transfer_candidate.findFirst({
      where: {
        tc_id: parsed.data.tcId,
        candidate_id: candidateId,
        deleted: 0,
      },
      select: { tc_id: true },
    });

    const existenceResult = paymentExistenceSchema.safeParse(existing);
    if (!existenceResult.success) {
      return paymentActionResultSchema.parse({
        success: false as const,
        error: "Payment not found or access denied",
      });
    }

    // Soft delete: set deleted flag
    await prisma.transfer_candidate.update({
      where: { tc_id: parsed.data.tcId },
      data: { deleted: 1 },
    });

    revalidatePath("/candidate/payments");

    return paymentActionResultSchema.parse({
      success: true as const,
    });
  } catch (e) {
    return paymentActionResultSchema.parse({
      success: false as const,
      error:
        e instanceof Error
          ? e.message
          : "Failed to delete payment.",
    });
  }
}
