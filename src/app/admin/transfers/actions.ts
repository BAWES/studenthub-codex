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

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listTransfersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().optional(),
});

export const getTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
});

export const approveTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
});

export const rejectTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
  reason: z.string().min(1, "Reason is required").max(500),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListTransfersInput = z.input<typeof listTransfersSchema>;

export type TransferRow = {
  id: number;
  company: string;
  period: string;
  status: string;
  statusCode: number;
  total: string | null;
  currencyCode: string | null;
  createdAt: string | null;
};

export type TransferDetail = {
  transfer: {
    transferId: number;
    total: string | null;
    companyTotal: string | null;
    transferCost: string | null;
    status: string;
    statusLabel: string;
    currencyCode: string | null;
    startDate: string | null;
    endDate: string | null;
    paymentReceivedOn: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    companyName: string | null;
    companyEmail: string | null;
  } | null;
  candidates: {
    tcId: number;
    candidateName: string | null;
    hours: number | null;
    amount: string | null;
    paid: number;
  }[];
  invoices: {
    invoiceId: number;
    invoiceDate: string | null;
    invoiceStatus: string | null;
  }[];
  metrics: { label: string; value: string | number; note: string }[];
};

export type TransferActionResponse = {
  success: boolean;
  error?: string;
};

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

  return {
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

  return {
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

    return { success: true };
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

    return { success: true };
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
 * @deprecated Use getTransferDetail() instead. Maps to old detail shape.
 */
export async function getAdminTransferDetail(
  transferId: number,
): Promise<{
  transfer: Record<string, unknown> | null;
  candidates: { id: number; title: string; subtitle: string; meta: string }[];
  invoices: { id: number; title: string; subtitle: string; meta: string }[];
  metrics: { label: string; value: string | number; note: string }[];
  fileEntries: never[];
}> {
  const result = await getTransferDetail(transferId);

  return {
    transfer: result.transfer
      ? {
          transfer_id: result.transfer.transferId,
          total: result.transfer.total,
          company_total: result.transfer.companyTotal,
          transfer_cost: result.transfer.transferCost,
          transfer_status: result.transfer.status,
          currency_code: result.transfer.currencyCode,
          start_date: result.transfer.startDate,
          end_date: result.transfer.endDate,
          payment_received_on: result.transfer.paymentReceivedOn,
          transfer_created_at: result.transfer.createdAt,
          transfer_updated_at: result.transfer.updatedAt,
          company: result.transfer.companyName
            ? { company_name: result.transfer.companyName, company_email: result.transfer.companyEmail }
            : null,
          staff_transfer_transfer_created_byTostaff: null,
          staff_transfer_transfer_updated_byTostaff: null,
        }
      : null,
    candidates: result.candidates.map((c) => ({
      id: c.tcId,
      title: c.candidateName ?? "Unknown candidate",
      subtitle: `Amount: ${c.amount ?? "—"} | Paid: ${c.paid ? "Yes" : "No"} | Hours: ${c.hours ?? 0}h`,
      meta: "",
    })),
    invoices: result.invoices.map((inv) => ({
      id: inv.invoiceId,
      title: `Invoice #${inv.invoiceId}`,
      subtitle: inv.invoiceStatus ?? "No status",
      meta: inv.invoiceDate ?? "",
    })),
    metrics: result.metrics,
    fileEntries: [],
  };
}

/**
 * @deprecated Use getTransferDetail() instead.
 */
export const getTransfer = getTransferDetail;
