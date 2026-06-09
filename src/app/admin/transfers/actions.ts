"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { formatDate, formatMoney } from "@/modules/workspace/format";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listAdminTransfersSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(60),
});

export const getAdminTransferDetailSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
});

export const approveTransferSchema = z.object({
  transferId: z.coerce.number().int().positive(),
});

export const rejectTransferSchema = z.object({
  transferId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TransferRow = {
  id: number;
  company: string;
  period: string;
  status: string;
  total: string;
};

export type TransferDetail = {
  transfer: {
    transfer_id: number;
    total: number | null;
    company_total: number | null;
    transfer_cost: number | null;
    transfer_status: number;
    start_date: Date | null;
    end_date: Date | null;
    payment_received_on: Date | null;
    transfer_created_at: Date;
    transfer_updated_at: Date;
    currency_code: string | null;
    company: { company_name: string | null; company_email: string | null } | null;
    staff_transfer_transfer_created_byTostaff: { staff_name: string | null } | null;
    staff_transfer_transfer_updated_byTostaff: { staff_name: string | null } | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
  candidates: { id: number; title: string; subtitle: string; meta: string }[];
  invoices: { id: number; title: string; subtitle: string; meta: string }[];
  fileEntries: { id: string; title: string; subtitle: string; meta: string }[];
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List transfer runs for the admin finance view.
 * Mirrors the legacy getAdminTransferRows().
 */
export async function listAdminTransfers(
  input: z.input<typeof listAdminTransfersSchema> = {},
): Promise<TransferRow[]> {
  await requireCapability("finance.read");

  const parsed = listAdminTransfersSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const rows = await prisma.transfer.findMany({
    where: { deleted: 0 },
    orderBy: { transfer_updated_at: "desc" },
    take: parsed.data.limit,
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
  });

  return rows.map((row) => ({
    id: row.transfer_id,
    company: row.company?.company_name ?? "No company",
    period: `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`,
    status: `Status ${row.transfer_status}`,
    total: formatMoney(row.total ?? row.company_total, row.currency_code ?? "KWD"),
  }));
}

/**
 * Get a single transfer run detail with candidates, invoices, and file entries.
 * Mirrors the legacy getAdminTransferDetail().
 */
export async function getAdminTransferDetail(
  transferId: number,
): Promise<TransferDetail> {
  await requireCapability("finance.read");

  const parsed = getAdminTransferDetailSchema.safeParse({ transferId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  const [transfer, candidates, invoices, fileEntries] = await prisma.$transaction([
    prisma.transfer.findUnique({
      where: { transfer_id: parsed.data.transferId },
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
      where: { transfer_id: parsed.data.transferId, deleted: 0 },
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
      where: { transfer_id: parsed.data.transferId, deleted: 0 },
      orderBy: { invoice_date: "desc" },
      take: 20,
      select: { invoice_id: true, invoice_date: true, invoice_status: true },
    }),
    prisma.transfer_file_entry.findMany({
      where: { transfer: { transfer_id: parsed.data.transferId } },
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

  return {
    transfer,
    metrics: [
      { label: "Total", value: formatMoney(transfer?.total, transfer?.currency_code ?? "KWD"), note: "Total transfer value" },
      { label: "Company Total", value: formatMoney(transfer?.company_total, transfer?.currency_code ?? "KWD"), note: "Total charged to company" },
      { label: "Cost", value: formatMoney(transfer?.transfer_cost, transfer?.currency_code ?? "KWD"), note: "Transfer operating cost" },
      { label: "Status", value: `Status ${transfer?.transfer_status ?? 0}`, note: "Legacy transfer status" },
      { label: "Candidates", value: candidates.length, note: "Payouts in this run" },
      { label: "Invoices", value: invoices.length, note: "Linked employer invoices" },
    ],
    candidates: candidates.map((c) => ({
      id: c.tc_id,
      title: c.candidate?.candidate_name ?? "Unknown candidate",
      subtitle: `Total: ${formatMoney(c.candidate_total, c.currency_code ?? transfer?.currency_code ?? "KWD")} | Paid: ${c.paid ? "Yes" : "No"} | Hours: ${c.hours ?? 0}h ${c.minutes ?? 0}m`,
      meta: c.candidate?.candidate_email ?? "",
    })),
    invoices: invoices.map((inv) => ({
      id: inv.invoice_id,
      title: `Invoice #${inv.invoice_id}`,
      subtitle: `${inv.invoice_status ?? "No status"}`,
      meta: formatDate(inv.invoice_date),
    })),
    fileEntries: fileEntries.map((entry) => ({
      id: entry.tfe_uuid,
      title: entry.beneficiary_name ?? "Transfer file entry",
      subtitle: entry.status_description ?? entry.status ?? "No status",
      meta: formatMoney(entry.credit_amount, entry.credit_currency ?? transfer?.currency_code ?? "KWD"),
    })),
  };
}

/**
 * Approve a transfer run (set status to 10 = approved/locked).
 */
export async function approveTransfer(transferId: number): Promise<{ success: boolean }> {
  await requireCapability("finance.write");

  const parsed = approveTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  await prisma.transfer.update({
    where: { transfer_id: parsed.data.transferId },
    data: { transfer_status: 10 },
  });

  revalidatePath("/admin/transfers");
  return { success: true };
}

/**
 * Reject a transfer run (set status to 0 = draft/unlocked).
 */
export async function rejectTransfer(transferId: number): Promise<{ success: boolean }> {
  await requireCapability("finance.write");

  const parsed = rejectTransferSchema.safeParse({ transferId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid params");
  }

  await prisma.transfer.update({
    where: { transfer_id: parsed.data.transferId },
    data: { transfer_status: 0 },
  });

  revalidatePath("/admin/transfers");
  return { success: true };
}
