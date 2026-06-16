"use server";

// ---------------------------------------------------------------------------
// Admin Transfer [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to the parent list-level actions.
//
// Actions:
//   - getTransfer          — single transfer detail (delegates to parent)
//   - updateTransferStatus — approve or reject a transfer with optional reason
// ---------------------------------------------------------------------------

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  getTransferDetail as parentGetTransfer,
  approveTransfer as parentApproveTransfer,
  rejectTransfer as parentRejectTransfer,
} from "../actions";

// Re-export parent types so consumers have a single import path
import type { TransferDetail, TransferActionResponse } from "../schemas";
export type { TransferDetail, TransferActionResponse };

import { getTransferSchema, updateTransferStatusSchema, transferStatusUpdateResultSchema, transferExistenceSchema } from "./schemas";
import type { UpdateTransferStatusInput } from "./schemas";

// ---------------------------------------------------------------------------
// getTransfer
// ---------------------------------------------------------------------------

/**
 * Get a single transfer with full detail (candidate payouts, invoices,
 * metrics). Delegates to the parent `getTransferDetail` action.
 */
export async function getTransfer(
  transferId: number,
): Promise<TransferDetail> {
  await requireCapability("finance.read");

  const parsed = getTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer ID");
  }

  return parentGetTransfer(parsed.data.transferId);
}

// ---------------------------------------------------------------------------
// updateTransferStatus
// ---------------------------------------------------------------------------

/**
 * Approve or reject a transfer with an optional reason.
 *
 * - `action: "approve"` — delegates to parent `approveTransfer`
 * - `action: "reject"`  — delegates to parent `rejectTransfer`
 *
 * Returns `{ success: boolean, error?: string }`.
 */
export async function updateTransferStatus(
  input: UpdateTransferStatusInput,
): Promise<z.output<typeof transferStatusUpdateResultSchema>> {
  await requireCapability("finance.mutate");

  const parsed = updateTransferStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { transferId, action, reason } = parsed.data;

  // Verify the transfer exists before acting
  const transfer = await prisma.transfer.findUnique({
    where: { transfer_id: transferId },
    select: { transfer_id: true, transfer_status: true },
  });

  const parsedTransfer = transferExistenceSchema.safeParse(transfer);
  if (!parsedTransfer.success || !parsedTransfer.data) {
    return { success: false, error: "Transfer not found" };
  }

  if (action === "approve") {
    const result = await parentApproveTransfer(transferId);
    const parsedResult = transferStatusUpdateResultSchema.safeParse(result);
    if (!parsedResult.success) {
      return { success: false, error: "Failed to approve transfer" };
    }
    if (!parsedResult.data.success) {
      return parsedResult.data;
    }
  } else {
    // action === "reject"
    const result = await parentRejectTransfer(transferId, reason);
    const parsedResult = transferStatusUpdateResultSchema.safeParse(result);
    if (!parsedResult.success) {
      return { success: false, error: "Failed to reject transfer" };
    }
    if (!parsedResult.data.success) {
      return parsedResult.data;
    }
  }

  revalidatePath("/admin/transfers");
  revalidatePath(`/admin/transfers/${transferId}`);

  return transferStatusUpdateResultSchema.parse({ success: true });
}
