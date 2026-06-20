"use server";

// ---------------------------------------------------------------------------
// Admin TransferController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/TransferController.php
//
// Actions:
//   - listTransfers       — paginated list of transfers with summary
//   - getTransferDetail   — single transfer detail with payouts and invoices
//   - approveTransfer     — approve/lock a pending transfer (status 10 → 20)
//   - rejectTransfer      — reject/cancel a transfer with a reason
//
// Transfer status convention:
//   10 = active/open (pending)
//   20 = locked/finalized (approved)
//   30 = cancelled/rejected
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listTransfersSchema,
  getTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
  listTransfersResultSchema,
  transferDetailResultSchema,
  transferActionResponseSchema,
  type ListTransfersInput,
  type TransferRow,
  type TransferDetail,
  type TransferActionResponse,
  type AdminTransferDetailResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Types — inferred from Zod schemas via z.output<>
// ---------------------------------------------------------------------------

export type { TransferRow, TransferDetail, TransferActionResponse, AdminTransferDetailResult };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<number, string> = {
  10: "Pending",
  20: "Approved",
  30: "Cancelled",
};

function getStatusLabel(code: number): string {
  return STATUS_LABELS[code] ?? `Unknown (${code})`;
}

// ---------------------------------------------------------------------------
// listTransfers
// ---------------------------------------------------------------------------

/**
 * List transfers with pagination and filtering.
 */
export async function listTransfers(
  input: ListTransfersInput = {},
): Promise<{
  items: TransferRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("finance.read");

  const parsed = listTransfersSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, companyId, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };
  if (companyId !== undefined) where.company_id = companyId;
  if (status !== undefined) where.transfer_status = status;

  const [transfers, total] = await Promise.all([
    prisma.transfer.findMany({
      where: where as any,
      orderBy: { transfer_created_at: "desc" },
      skip,
      take: limit,
      include: {
        company: { select: { company_name: true } },
        transfer_candidate: {
          where: { deleted: 0 },
          select: { tc_id: true },
        },
      },
    }),
    prisma.transfer.count({ where: where as any }),
  ]);

  const result = {
    items: transfers.map((t: any): TransferRow => ({
      id: t.transfer_id,
      company: t.company?.company_name ?? "No company",
      period:
        t.start_date && t.end_date
          ? `${new Date(t.start_date).toLocaleDateString("en-KW", { month: "short", day: "numeric" })} – ${new Date(t.end_date).toLocaleDateString("en-KW", { month: "short", day: "numeric" })}`
          : "N/A",
      status: getStatusLabel(t.transfer_status),
      statusCode: t.transfer_status,
      total: t.total ? t.total.toString() : null,
      currencyCode: t.currency_code ?? null,
      createdAt: t.transfer_created_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log mismatches without throwing
  const listParsed = listTransfersResultSchema.safeParse(result);
  if (!listParsed.success) {
    console.error("[admin/transfers] listTransfers output failed:", listParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getTransferDetail
// ---------------------------------------------------------------------------

/**
 * Get a single transfer with candidate payouts and invoices.
 */
export async function getTransferDetail(
  transferId: number,
): Promise<TransferDetail> {
  await requireCapability("finance.read");

  const parsed = getTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer ID");
  }

  const [transfer, candidateRecords, invoiceRecords] = await prisma.$transaction([
    prisma.transfer.findUnique({
      where: { transfer_id: parsed.data.transferId },
      include: {
        company: { select: { company_name: true, company_email: true } },
      },
    }),
    prisma.transfer_candidate.findMany({
      where: { transfer_id: parsed.data.transferId, deleted: 0 },
      include: {
        candidate: { select: { candidate_name: true } },
      },
    }),
    prisma.invoice.findMany({
      where: { transfer_id: parsed.data.transferId, deleted: 0 },
    }),
  ] as const);

  if (!transfer) {
    throw new Error(`Transfer #${transferId} not found`);
  }

  const t = transfer as any;

  const candidates = (candidateRecords ?? []).map((tc: any) => ({
    tcId: tc.tc_id,
    candidateName: tc.candidate?.candidate_name ?? null,
    hours: tc.hours ?? null,
    amount: tc.candidate_total ? tc.candidate_total.toString() : null,
    paid: tc.paid ?? 0,
  }));

  const invoices = (invoiceRecords ?? []).map((inv: any) => ({
    invoiceId: inv.invoice_id,
    invoiceDate: inv.invoice_date?.toISOString() ?? null,
    invoiceStatus: typeof inv.invoice_status === "number" ? `Status ${inv.invoice_status}` : (inv.invoice_status ?? null),
  }));

  const metrics = [
    { label: "Candidate Payouts", value: candidates.length, note: "Transfers to candidates" },
    { label: "Invoices", value: invoices.length, note: "Employer invoices attached" },
    { label: "Status", value: getStatusLabel(t.transfer_status), note: "" },
    { label: "Total", value: t.total ? t.total.toString() : "—", note: t.currency_code ?? "KWD" },
  ];

  const detailResult = {
    transfer: {
      transferId: t.transfer_id,
      total: t.total ? t.total.toString() : null,
      companyTotal: t.company_total ? t.company_total.toString() : null,
      transferCost: t.transfer_cost ? t.transfer_cost.toString() : null,
      status: getStatusLabel(t.transfer_status),
      statusLabel: getStatusLabel(t.transfer_status),
      currencyCode: t.currency_code ?? null,
      startDate: t.start_date?.toISOString() ?? null,
      endDate: t.end_date?.toISOString() ?? null,
      paymentReceivedOn: t.payment_received_on?.toISOString() ?? null,
      createdAt: t.transfer_created_at?.toISOString() ?? null,
      updatedAt: t.transfer_updated_at?.toISOString() ?? null,
      companyName: t.company?.company_name ?? null,
      companyEmail: t.company?.company_email ?? null,
    },
    candidates,
    invoices,
    metrics,
  };

  // Output validation — log mismatches without throwing
  const detailParsed = transferDetailResultSchema.safeParse(detailResult);
  if (!detailParsed.success) {
    console.error("[admin/transfers] getTransferDetail output failed:", detailParsed.error.issues);
  }

  return detailResult;
}

// ---------------------------------------------------------------------------
// approveTransfer
// ---------------------------------------------------------------------------

/**
 * Approve/lock a pending transfer. Changes status from 10 (open) to 20 (locked).
 */
export async function approveTransfer(
  transferId: number,
): Promise<TransferActionResponse> {
  await requireCapability("finance.mutate");

  const parsed = getTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid transfer ID",
    };
  }

  const transfer = await prisma.transfer.findUnique({
    where: { transfer_id: parsed.data.transferId },
    select: { transfer_id: true, transfer_status: true },
  });

  if (!transfer) {
    return { success: false, error: "Transfer not found" };
  }

  if (transfer.transfer_status !== 10) {
    return {
      success: false,
      error: `Only pending transfers can be approved. Current status: ${getStatusLabel(transfer.transfer_status)}`,
    };
  }

  try {
    await prisma.transfer.update({
      where: { transfer_id: parsed.data.transferId },
      data: {
        transfer_status: 20,
      },
    });

    revalidatePath("/admin/transfers");
    revalidatePath(`/admin/transfers/${parsed.data.transferId}`);

    const approvalResult = { success: true };

    // Output validation — log mismatches without throwing
    const approveParsed = transferActionResponseSchema.safeParse(approvalResult);
    if (!approveParsed.success) {
      console.error("[admin/transfers] approveTransfer output failed:", approveParsed.error.issues);
    }

    return approvalResult;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to approve transfer",
    };
  }
}

// ---------------------------------------------------------------------------
// rejectTransfer
// ---------------------------------------------------------------------------

/**
 * Reject/cancel a transfer with a reason. Sets status to 30 (cancelled).
 */
export async function rejectTransfer(
  transferId: number,
  reason: string,
): Promise<TransferActionResponse> {
  if (!reason || reason.trim().length === 0) {
    return { success: false, error: "Reason is required" };
  }

  await requireCapability("finance.mutate");

  const parsed = getTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid transfer ID",
    };
  }

  const transfer = await prisma.transfer.findUnique({
    where: { transfer_id: parsed.data.transferId },
    select: { transfer_id: true, transfer_status: true },
  });

  if (!transfer) {
    return { success: false, error: "Transfer not found" };
  }

  if (transfer.transfer_status !== 10) {
    return {
      success: false,
      error: `Only pending transfers can be rejected. Current status: ${getStatusLabel(transfer.transfer_status)}`,
    };
  }

  try {
    await prisma.transfer.update({
      where: { transfer_id: parsed.data.transferId },
      data: {
        transfer_status: 30,
      },
    });

    revalidatePath("/admin/transfers");
    revalidatePath(`/admin/transfers/${parsed.data.transferId}`);

    const rejectResult = { success: true };

    // Output validation — log mismatches without throwing
    const rejectParsed = transferActionResponseSchema.safeParse(rejectResult);
    if (!rejectParsed.success) {
      console.error("[admin/transfers] rejectTransfer output failed:", rejectParsed.error.issues);
    }

    return rejectResult;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reject transfer",
    };
  }
}

// ---------------------------------------------------------------------------
// Legacy compatibility aliases
// ---------------------------------------------------------------------------

/**
 * @deprecated Use listTransfers() instead. Maps to old row shape.
 */
export async function listAdminTransfers(
  input: ListTransfersInput = {},
): Promise<{ id: number; company: string; period: string; status: string; total: string }[]> {
  const result = await listTransfers(input);
  return result.items.map((row) => ({
    id: row.id,
    company: row.company,
    period: row.period,
    status: row.status,
    total: row.total ?? "—",
  }));
}

/**
 * @deprecated Use getTransferDetail() instead. Maps to old detail shape for backward compatibility.
 */
export async function getAdminTransferDetail(
  transferId: number,
): Promise<AdminTransferDetailResult> {
  await requireCapability("finance.read");

  const [transfer, candidateRecords, invoiceRecords] = await prisma.$transaction([
    prisma.transfer.findUnique({
      where: { transfer_id: transferId },
      include: {
        company: { select: { company_name: true, company_email: true } },
        staff_transfer_transfer_created_byTostaff: { select: { staff_name: true } },
        staff_transfer_transfer_updated_byTostaff: { select: { staff_name: true } },
      },
    }),
    prisma.transfer_candidate.findMany({
      where: { transfer_id: transferId, deleted: 0 },
      include: {
        candidate: { select: { candidate_name: true } },
      },
    }),
    prisma.invoice.findMany({
      where: { transfer_id: transferId, deleted: 0 },
    }),
  ] as const);

  if (!transfer) {
    return {
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
      fileEntries: [],
    };
  }

  const candidates = (candidateRecords ?? []).map((tc) => ({
    id: tc.tc_id,
    title: tc.candidate?.candidate_name ?? "Unknown candidate",
    subtitle: `Amount: ${tc.candidate_total ? tc.candidate_total.toString() : "—"} | Paid: ${tc.paid ? "Yes" : "No"} | Hours: ${tc.hours ?? 0}h`,
    meta: "",
  }));

  const invoices = (invoiceRecords ?? []).map((inv) => ({
    id: inv.invoice_id,
    title: `Invoice #${inv.invoice_id}`,
    subtitle: typeof inv.invoice_status === "number" ? `Status ${inv.invoice_status}` : (inv.invoice_status ?? "No status"),
    meta: inv.invoice_date?.toISOString() ?? "",
  }));

  const metrics = [
    { label: "Candidate Payouts", value: candidates.length, note: "Transfers to candidates" },
    { label: "Invoices", value: invoices.length, note: "Employer invoices attached" },
    { label: "Status", value: getStatusLabel(transfer.transfer_status), note: "" },
    { label: "Total", value: transfer.total ? transfer.total.toString() : "—", note: transfer.currency_code ?? "KWD" },
  ];

  return {
    transfer: {
      transfer_id: transfer.transfer_id,
      total: transfer.total ? transfer.total.toString() : null,
      company_total: transfer.company_total ? transfer.company_total.toString() : null,
      transfer_cost: transfer.transfer_cost ? transfer.transfer_cost.toString() : null,
      transfer_status: transfer.transfer_status,
      currency_code: transfer.currency_code,
      start_date: transfer.start_date,
      end_date: transfer.end_date,
      payment_received_on: transfer.payment_received_on,
      transfer_created_at: transfer.transfer_created_at,
      transfer_updated_at: transfer.transfer_updated_at,
      company: transfer.company
        ? { company_name: transfer.company.company_name, company_email: transfer.company.company_email }
        : null,
      staff_transfer_transfer_created_byTostaff: transfer.staff_transfer_transfer_created_byTostaff,
      staff_transfer_transfer_updated_byTostaff: transfer.staff_transfer_transfer_updated_byTostaff,
    },
    candidates,
    invoices,
    metrics,
    fileEntries: [],
  };
}

/**
 * @deprecated Use getTransferDetail() instead.
 */
export async function getTransfer(
  transferId: number,
): Promise<TransferDetail> {
  return getTransferDetail(transferId);
}
