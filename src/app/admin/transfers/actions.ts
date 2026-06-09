"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate, formatMoney } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listTransfersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(60),
  q: z.string().optional(),
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
  reason: z.string().min(1, "Rejection reason is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListTransfersInput = z.input<typeof listTransfersSchema>;
export type GetTransferInput = z.input<typeof getTransferSchema>;

export type TransferRow = {
  id: number;
  company: string;
  period: string;
  status: string;
  statusCode: number;
  total: string;
};

export type TransferDetail = {
  transfer: {
    transferId: number;
    total: string;
    companyTotal: string;
    transferCost: string;
    statusCode: number;
    status: string;
    startDate: string;
    endDate: string;
    period: string;
    paymentReceivedOn: string | null;
    createdAt: string;
    updatedAt: string;
    currencyCode: string;
    companyName: string;
    companyEmail: string | null;
    createdBy: string | null;
    updatedBy: string | null;
  };
  metrics: { label: string; value: string | number; note: string }[];
  candidates: {
    id: number;
    name: string;
    email: string | null;
    store: string | null;
    candidateTotal: string;
    companyTotal: string;
    transferCost: string;
    hours: number | null;
    minutes: number | null;
    paid: boolean;
    currencyCode: string;
  }[];
  invoices: {
    id: number;
    date: string;
    status: string | null;
  }[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusLabel(code: number): string {
  switch (code) {
    case 10:
      return "Pending";
    case 20:
      return "Approved";
    case 30:
      return "Rejected";
    case 40:
      return "Paid";
    default:
      return `Status ${code}`;
  }
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List all transfers (runs) for the admin finance view.
 * Paginated with optional search and status filter.
 * Mirrors the legacy getAdminTransferRows().
 */
export async function listTransfers(
  input: ListTransfersInput = {},
): Promise<{ items: TransferRow[]; total: number; page: number; limit: number; totalPages: number }> {
  await requireCapability("finance.read");

  const parsed = listTransfersSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 60, totalPages: 0 };
  }

  const { page, limit, q, status } = parsed.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = { deleted: 0 };

  if (typeof status === "number") {
    where.transfer_status = status;
  }

  if (q && q.trim().length > 0) {
    where.OR = [
      { company: { company_name: { contains: q.trim() } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.transfer.findMany({
      where: where as any,
      orderBy: { transfer_updated_at: "desc" },
      skip,
      take: limit,
      select: {
        transfer_id: true,
        total: true,
        company_total: true,
        transfer_status: true,
        start_date: true,
        end_date: true,
        currency_code: true,
        company: { select: { company_name: true } },
      },
    }),
    prisma.transfer.count({ where: where as any }),
  ]);

  const items: TransferRow[] = rows.map((row) => ({
    id: row.transfer_id,
    company: row.company?.company_name ?? "No company",
    period: `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`,
    status: statusLabel(row.transfer_status),
    statusCode: row.transfer_status,
    total: formatMoney(row.total ?? row.company_total, row.currency_code ?? "KWD"),
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single transfer run by ID with full detail.
 * Mirrors the legacy getAdminTransferDetail().
 */
export async function getTransferDetail(
  transferId: number,
): Promise<TransferDetail> {
  await requireCapability("finance.read");

  const parsed = getTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transfer ID");
  }

  const id = parsed.data.transferId;

  const [transfer, candidates, invoices, fileEntries] = await prisma.$transaction([
    prisma.transfer.findUnique({
      where: { transfer_id: id },
      select: {
        transfer_id: true,
        total: true,
        company_total: true,
        transfer_cost: true,
        transfer_status: true,
        start_date: true,
        end_date: true,
        payment_received_on: true,
        transfer_created_at: true,
        transfer_updated_at: true,
        currency_code: true,
        company: { select: { company_name: true, company_email: true } },
        staff_transfer_transfer_created_byTostaff: { select: { staff_name: true } },
        staff_transfer_transfer_updated_byTostaff: { select: { staff_name: true } },
      },
    }),
    prisma.transfer_candidate.findMany({
      where: { transfer_id: id, deleted: 0 },
      orderBy: { tc_updated_at: "desc" },
      take: 80,
      select: {
        tc_id: true,
        candidate_total: true,
        company_total: true,
        transfer_cost: true,
        hours: true,
        minutes: true,
        paid: true,
        currency_code: true,
        candidate: { select: { candidate_name: true, candidate_email: true } },
        store: { select: { store_name: true } },
      },
    }),
    prisma.invoice.findMany({
      where: { transfer_id: id, deleted: 0 },
      orderBy: { invoice_date: "desc" },
      take: 20,
      select: { invoice_id: true, invoice_date: true, invoice_status: true },
    }),
    prisma.transfer_file_entry.findMany({
      where: { transfer: { transfer_id: id } },
      take: 20,
      select: {
        tfe_uuid: true,
        status: true,
        status_description: true,
        credit_amount: true,
        credit_currency: true,
        beneficiary_name: true,
      },
    }),
  ]);

  if (!transfer) {
    throw new Error(`Transfer #${id} not found`);
  }

  const currency = transfer.currency_code ?? "KWD";

  return {
    transfer: {
      transferId: transfer.transfer_id,
      total: formatMoney(transfer.total ?? transfer.company_total, currency),
      companyTotal: formatMoney(transfer.company_total, currency),
      transferCost: formatMoney(transfer.transfer_cost, currency),
      statusCode: transfer.transfer_status,
      status: statusLabel(transfer.transfer_status),
      startDate: formatDate(transfer.start_date),
      endDate: formatDate(transfer.end_date),
      period: `${formatDate(transfer.start_date)} to ${formatDate(transfer.end_date)}`,
      paymentReceivedOn: transfer.payment_received_on ? formatDate(transfer.payment_received_on) : null,
      createdAt: formatDate(transfer.transfer_created_at),
      updatedAt: formatDate(transfer.transfer_updated_at),
      currencyCode: currency,
      companyName: transfer.company?.company_name ?? "Unknown",
      companyEmail: transfer.company?.company_email ?? null,
      createdBy: transfer.staff_transfer_transfer_created_byTostaff?.staff_name ?? null,
      updatedBy: transfer.staff_transfer_transfer_updated_byTostaff?.staff_name ?? null,
    },
    metrics: [
      { label: "Status", value: statusLabel(transfer.transfer_status), note: `Code ${transfer.transfer_status}` },
      { label: "Total", value: formatMoney(transfer.total ?? transfer.company_total, currency), note: "Transfer total" },
      { label: "Cost", value: formatMoney(transfer.transfer_cost, currency), note: "Transfer cost" },
      { label: "Candidates", value: candidates.length, note: "Candidate payout rows shown" },
    ],
    candidates: candidates.map((row) => ({
      id: row.tc_id,
      name: row.candidate?.candidate_name ?? "Unknown candidate",
      email: row.candidate?.candidate_email ?? null,
      store: row.store?.store_name ?? null,
      candidateTotal: formatMoney(row.candidate_total, row.currency_code ?? currency),
      companyTotal: formatMoney(row.company_total, row.currency_code ?? currency),
      transferCost: formatMoney(row.transfer_cost, row.currency_code ?? currency),
      hours: row.hours,
      minutes: row.minutes,
      paid: row.paid === 1,
      currencyCode: row.currency_code ?? currency,
    })),
    invoices: invoices.map((inv) => ({
      id: inv.invoice_id,
      date: formatDate(inv.invoice_date),
      status: inv.invoice_status,
    })),
  };
}

/**
 * Approve a pending transfer run.
 * Admin action — requires finance.write capability.
 */
export async function approveTransfer(
  transferId: number,
): Promise<{ success: boolean; error?: string }> {
  await requireCapability("finance.mutate");

  const parsed = approveTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    return { success: false, error: "Invalid transfer ID" };
  }

  const id = parsed.data.transferId;

  const existing = await prisma.transfer.findUnique({
    where: { transfer_id: id },
    select: { transfer_id: true, transfer_status: true },
  });

  if (!existing) {
    return { success: false, error: "Transfer not found" };
  }

  // Only pending transfers can be approved
  if (existing.transfer_status !== 10) {
    return {
      success: false,
      error: `Cannot approve transfer with status ${statusLabel(existing.transfer_status)}. Only pending transfers can be approved.`,
    };
  }

  await prisma.transfer.update({
    where: { transfer_id: id },
    data: { transfer_status: 20 },
  });

  revalidatePath("/admin/transfers");
  revalidatePath(`/admin/transfers/${id}`);
  return { success: true };
}

/**
 * Reject a pending transfer run with a reason.
 * Admin action — requires finance.mutate capability.
 * Note: reason is validated but not currently persisted
 * (the note model lacks a transfer_id foreign key).
 */
export async function rejectTransfer(
  transferId: number,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  await requireCapability("finance.mutate");

  const parsed = rejectTransferSchema.safeParse({ transferId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const id = parsed.data.transferId;

  const existing = await prisma.transfer.findUnique({
    where: { transfer_id: id },
    select: { transfer_id: true, transfer_status: true },
  });

  if (!existing) {
    return { success: false, error: "Transfer not found" };
  }

  // Only pending transfers can be rejected
  if (existing.transfer_status !== 10) {
    return {
      success: false,
      error: `Cannot reject transfer with status ${statusLabel(existing.transfer_status)}. Only pending transfers can be rejected.`,
    };
  }

  await prisma.transfer.update({
    where: { transfer_id: id },
    data: { transfer_status: 30 },
  });

  revalidatePath("/admin/transfers");
  revalidatePath(`/admin/transfers/${id}`);
  return { success: true };
}
