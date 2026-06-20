"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

/**
 * Toggle a transfer_candidate row between paid and unpaid.
 * Only admin can mutate finance records.
 */
export async function toggleCandidatePaidAction(formData: FormData) {
  const session = await requireCapability("finance.mutate");

  const tcId = Number(formData.get("tc_id"));
  const transferId = Number(formData.get("transfer_id"));
  const detailPath = `/admin/transfers/${transferId}`;

  if (!Number.isInteger(tcId) || tcId <= 0 || !Number.isInteger(transferId) || transferId <= 0) {
    redirect(`${detailPath}?notice=invalid-params` as Route);
  }

  const transfer = await prisma.transfer.findUnique({
    where: { transfer_id: transferId, deleted: 0 },
    select: { transfer_id: true }
  });

  if (!transfer) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const candidate = await prisma.transfer_candidate.findFirst({
    where: { tc_id: tcId, transfer_id: transferId, deleted: 0 },
    select: { tc_id: true, paid: true }
  });

  if (!candidate) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const newPaidState = candidate.paid ? 0 : 1;

  await prisma.transfer_candidate.update({
    where: { tc_id: tcId },
    data: { paid: newPaidState }
  });

  const now = new Date();
  await prisma.transfer.update({
    where: { transfer_id: transferId },
    data: {
      transfer_updated_at: now,
      transfer_updated_by: Number(session.id)
    }
  });

  revalidatePath(detailPath);
  revalidatePath("/admin/transfers");
  redirect(`${detailPath}?notice=paid-toggled` as Route);
}

/**
 * Toggle a transfer's lock status (transfer_status).
 * Status 10 = active/open, Status 20 = locked/finalized.
 */
export async function toggleTransferStatusAction(formData: FormData) {
  const session = await requireCapability("finance.mutate");

  const transferId = Number(formData.get("transfer_id"));
  const detailPath = `/admin/transfers/${transferId}`;

  if (!Number.isInteger(transferId) || transferId <= 0) {
    redirect(`${detailPath}?notice=invalid-params` as Route);
  }

  const transfer = await prisma.transfer.findUnique({
    where: { transfer_id: transferId, deleted: 0 },
    select: { transfer_id: true, transfer_status: true }
  });

  if (!transfer) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const newStatus = transfer.transfer_status === 10 ? 20 : 10;
  const now = new Date();

  await prisma.transfer.update({
    where: { transfer_id: transferId },
    data: {
      transfer_status: newStatus,
      transfer_updated_at: now,
      transfer_updated_by: Number(session.id)
    }
  });

  revalidatePath(detailPath);
  revalidatePath("/admin/transfers");
  redirect(`${detailPath}?notice=status-toggled` as Route);
}

/**
 * Mark a transfer's payment as received.
 * Sets payment_received_on to the provided date (or today).
 */
export async function markPaymentReceivedAction(formData: FormData) {
  const session = await requireCapability("finance.mutate");

  const transferId = Number(formData.get("transfer_id"));
  const receivedDate = String(formData.get("received_on") ?? "");
  const detailPath = `/admin/transfers/${transferId}`;

  if (!Number.isInteger(transferId) || transferId <= 0) {
    redirect(`${detailPath}?notice=invalid-params` as Route);
  }

  const paymentDate = receivedDate ? new Date(receivedDate) : new Date();

  if (isNaN(paymentDate.getTime())) {
    redirect(`${detailPath}?notice=invalid-date` as Route);
  }

  const transfer = await prisma.transfer.findUnique({
    where: { transfer_id: transferId, deleted: 0 },
    select: { transfer_id: true }
  });

  if (!transfer) {
    redirect(`${detailPath}?notice=not-found` as Route);
  }

  const now = new Date();

  await prisma.transfer.update({
    where: { transfer_id: transferId },
    data: {
      payment_received_on: paymentDate,
      transfer_updated_at: now,
      transfer_updated_by: Number(session.id)
    }
  });

  revalidatePath(detailPath);
  revalidatePath("/admin/transfers");
  redirect(`${detailPath}?notice=payment-received` as Route);
}

/**
 * Delete/soft-delete a transfer (sets deleted = 1).
 */
export async function deleteTransferAction(formData: FormData) {
  const session = await requireCapability("finance.mutate");

  const transferId = Number(formData.get("transfer_id"));
  const cancelPath = "/admin/transfers";

  if (!Number.isInteger(transferId) || transferId <= 0) {
    redirect(`${cancelPath}?notice=invalid-params` as Route);
  }

  const transfer = await prisma.transfer.findUnique({
    where: { transfer_id: transferId, deleted: 0 },
    select: { transfer_id: true }
  });

  if (!transfer) {
    redirect(`${cancelPath}?notice=not-found` as Route);
  }

  const now = new Date();

  await prisma.transfer.update({
    where: { transfer_id: transferId },
    data: {
      deleted: 1,
      transfer_updated_at: now,
      transfer_updated_by: Number(session.id)
    }
  });

  revalidatePath(cancelPath);
  revalidatePath("/admin");
  redirect(`${cancelPath}?notice=transfer-deleted` as Route);
}
