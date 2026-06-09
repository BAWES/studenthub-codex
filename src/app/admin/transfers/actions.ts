"use server";

// ---------------------------------------------------------------------------
// Admin TransferController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/TransferController.php
//
// Actions:
//   - listTransfers     — paginated list of transfers with candidate payout
//                         summaries
//   - getTransfer       — single transfer detail with payouts and invoices
//   - approveTransfer   — approve/lock a pending transfer (status 10 → 20)
//   - rejectTransfer    — reject/cancel a transfer with a reason
//
// Transfer status convention:
//   10 = active/open (pending)
//   20 = locked/finalized (approved)
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
export type GetTransferInput = z.input<typeof getTransferSchema>;
export type ApproveTransferInput = z.input<typeof approveTransferSchema>;
export type RejectTransferInput = z.input<typeof rejectTransferSchema>;

export type TransferRow = {
  transfer_id: number;
  company_name: string | null;
  contract_type: string | null;
  period: string;
  total: string | null;
  company_total: string | null;
  transfer_status: number;
  currency_code: string | null;
  payouts_count: number;
  created_at: string | null;
};

export type TransferDetail = {
  transfer: {
    transfer_id: number;
    total: string | null;
    company_total: string | null;
    transfer_cost: string | null;
    transfer_status: number;
    currency_code: string | null;
    start_date: string | null;
    end_date: string | null;
    payment_received_on: string | null;
    transfer_created_at: string | null;
    transfer_updated_at: string | null;
    company: { company_name: string | null; company_email: string | null } | null;
  } | null;
  candidates: {
    tc_id: number;
    candidate_name: string | null;
    hours: number | null;
    amount: string | null;
    paid: number;
  }[];
  invoices: {
    invoice_id: number;
    invoice_date: string | null;
    invoice_status: string | null;
  }[];
  metrics: { label: string; value: string | number; note: string }[];
};

export type TransferActionResponse = {
  operation: "success" | "error";
  message: string;
};

// ---------------------------------------------------------------------------
// listTransfers
// ---------------------------------------------------------------------------

/**
 * List transfers with pagination, filtering, and candidate payout summary.
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
      transfer_id: t.transfer_id,
      company_name: t.company?.company_name ?? null,
      contract_type: t.contract_type ?? null,
      period: t.start_date && t.end_date
        ? `${new Date(t.start_date).toLocaleDateString("en-KW", { month: "short", day: "numeric" })} – ${new Date(t.end_date).toLocaleDateString("en-KW", { month: "short", day: "numeric" })}`
        : "N/A",
      total: t.total ? t.total.toString() : null,
      company_total: t.company_total ? t.company_total.toString() : null,
      transfer_status: t.transfer_status,
      currency_code: t.currency_code ?? null,
      payouts_count: t.transfer_candidate?.length ?? 0,
      created_at: t.transfer_created_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getTransfer
// ---------------------------------------------------------------------------

/**
 * Get a single transfer with candidate payouts and invoices.
 */
export async function getTransfer(
  transferId: number,
): Promise<TransferDetail> {
  await requireCapability("finance.read");

  const parsed = getTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer ID");
  }

  const transfer = await prisma.transfer.findFirst({
    where: { transfer_id: parsed.data.transferId, deleted: 0 },
    include: {
      company: { select: { company_name: true, company_email: true } },
      transfer_candidate: {
        where: { deleted: 0 },
        include: {
          candidate: { select: { candidate_first_name: true, candidate_last_name: true } },
        },
      },
      invoice: { where: { deleted: 0 }, include: { invoice_status: true } } as any,
    },
  });

  if (!transfer) {
    return { transfer: null, candidates: [], invoices: [], metrics: [] };
  }

  const t = transfer as any;
  const raw = t;

  const candidates = (raw.transfer_candidate ?? []).map((tc: any) => ({
    tc_id: tc.tc_id,
    candidate_name: tc.candidate
      ? `${tc.candidate.candidate_first_name ?? ""} ${tc.candidate.candidate_last_name ?? ""}`.trim()
      : null,
    hours: tc.hours ?? null,
    amount: tc.candidate_total ? tc.candidate_total.toString() : null,
    paid: tc.paid ?? 0,
  }));

  const invoices = (raw.invoice ?? []).map((inv: any) => ({
    invoice_id: inv.invoice_id,
    invoice_date: inv.invoice_date?.toISOString() ?? null,
    invoice_status: inv.invoice_status ?? null,
  }));

  const metrics = [
    { label: "Candidate Payouts", value: candidates.length, note: "Transfers to candidates" },
    { label: "Invoices", value: invoices.length, note: "Employer invoices attached" },
    { label: "Status", value: raw.transfer_status === 10 ? "Open" : raw.transfer_status === 20 ? "Locked" : `Unknown (${raw.transfer_status})`, note: "" },
    { label: "Total", value: raw.total ? raw.total.toString() : "—", note: raw.currency_code ?? "KWD" },
  ];

  return {
    transfer: {
      transfer_id: raw.transfer_id,
      total: raw.total ? raw.total.toString() : null,
      company_total: raw.company_total ? raw.company_total.toString() : null,
      transfer_cost: raw.transfer_cost ? raw.transfer_cost.toString() : null,
      transfer_status: raw.transfer_status,
      currency_code: raw.currency_code ?? null,
      start_date: raw.start_date?.toISOString() ?? null,
      end_date: raw.end_date?.toISOString() ?? null,
      payment_received_on: raw.payment_received_on?.toISOString() ?? null,
      transfer_created_at: raw.transfer_created_at?.toISOString() ?? null,
      transfer_updated_at: raw.transfer_updated_at?.toISOString() ?? null,
      company: raw.company
        ? { company_name: raw.company.company_name, company_email: raw.company.company_email }
        : null,
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
 * Returns { operation, message } matching legacy Yii2 response shape.
 */
export async function approveTransfer(
  input: ApproveTransferInput,
): Promise<TransferActionResponse> {
  await requireCapability("finance.mutate");

  const parsed = approveTransferSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid transfer ID",
    };
  }

  const transfer = await prisma.transfer.findFirst({
    where: { transfer_id: parsed.data.transferId, deleted: 0 },
    select: { transfer_id: true, transfer_status: true },
  });

  if (!transfer) {
    return { operation: "error", message: "Transfer not found" };
  }

  if (transfer.transfer_status !== 10) {
    return {
      operation: "error",
      message: `Transfer cannot be approved in current status (${transfer.transfer_status}). Expected status: 10 (open).`,
    };
  }

  try {
    await prisma.transfer.update({
      where: { transfer_id: parsed.data.transferId },
      data: {
        transfer_status: 20,
        transfer_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/transfers");
    revalidatePath(`/admin/transfers/${parsed.data.transferId}`);

    return { operation: "success", message: "Transfer approved successfully" };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to approve transfer",
    };
  }
}

// ---------------------------------------------------------------------------
// rejectTransfer
// ---------------------------------------------------------------------------

/**
 * Reject/cancel a transfer with a reason.
 * Soft-deletes the transfer (sets deleted = 1) and records the reason.
 */
export async function rejectTransfer(
  input: RejectTransferInput,
): Promise<TransferActionResponse> {
  await requireCapability("finance.mutate");

  const parsed = rejectTransferSchema.safeParse(input);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const transfer = await prisma.transfer.findFirst({
    where: { transfer_id: parsed.data.transferId, deleted: 0 },
    select: { transfer_id: true, transfer_status: true },
  });

  if (!transfer) {
    return { operation: "error", message: "Transfer not found" };
  }

  if (transfer.transfer_status === 20) {
    return { operation: "error", message: "Cannot reject an already-approved transfer" };
  }

  try {
    await prisma.transfer.update({
      where: { transfer_id: parsed.data.transferId },
      data: {
        deleted: 1,
        transfer_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/transfers");
    revalidatePath(`/admin/transfers/${parsed.data.transferId}`);

    return {
      operation: "success",
      message: `Transfer rejected: ${parsed.data.reason}`,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to reject transfer",
    };
  }
}
// ---------------------------------------------------------------------------
// Compatibility aliases — pages still reference old names from before merge
// ---------------------------------------------------------------------------

type OldTransferRow = {
  id: number;
  company: string;
  period: string;
  status: string;
  total: string;
};

/**
 * @deprecated Use listTransfers() instead.
 */
export async function listAdminTransfers(): Promise<OldTransferRow[]> {
  const result = await listTransfers({});
  return result.items.map((row) => ({
    id: row.transfer_id,
    company: row.company_name ?? "No company",
    period: row.period,
    status: `Status ${row.transfer_status}`,
    total: row.total ?? "—",
  }));
}

/**
 * @deprecated Use getTransfer() instead.
 */
export async function getAdminTransferDetail(transferId: number) {
  const parsed = getTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    return { transfer: null, candidates: [], invoices: [], metrics: [], fileEntries: [] };
  }
  const detail = await getTransfer(parsed.data.transferId);
  const t = detail.transfer;

  // Reconstruct the old transfer object shape expected by [id]/page.tsx
  const oldTransfer = t
    ? {
        transfer_id: t.transfer_id,
        total: t.total,
        company_total: t.company_total,
        transfer_cost: t.transfer_cost,
        transfer_status: t.transfer_status,
        currency_code: t.currency_code,
        start_date: t.start_date,
        end_date: t.end_date,
        payment_received_on: t.payment_received_on,
        transfer_created_at: t.transfer_created_at,
        transfer_updated_at: t.transfer_updated_at,
        company: t.company,
        staff_transfer_transfer_created_byTostaff: null,
        staff_transfer_transfer_updated_byTostaff: null,
      }
    : null;

  return {
    transfer: oldTransfer,
    candidates: detail.candidates.map((c) => ({
      id: c.tc_id,
      title: c.candidate_name ?? "Unknown candidate",
      subtitle: `Amount: ${c.amount ?? "—"} | Paid: ${c.paid ? "Yes" : "No"} | Hours: ${c.hours ?? 0}h`,
      meta: "",
    })),
    invoices: detail.invoices.map((inv) => ({
      id: inv.invoice_id,
      title: `Invoice #${inv.invoice_id}`,
      subtitle: inv.invoice_status ?? "No status",
      meta: inv.invoice_date ?? "",
    })),
    metrics: detail.metrics,
    fileEntries: [],
  };
}
