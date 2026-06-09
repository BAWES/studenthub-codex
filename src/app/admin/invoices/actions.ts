"use server";

// ---------------------------------------------------------------------------
// Admin InvoiceController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/InvoiceController.php
//
// Actions:
//   - listInvoices   — paginated list of invoices with transfer info
//   - getInvoice     — single invoice detail with transfer + payouts
//
// Invoice status enum: paid, unpaid
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["paid", "unpaid"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  companyId: z.coerce.number().int().positive().optional(),
});

export const getInvoiceSchema = z.object({
  invoiceId: z.coerce.number().int().positive("Invoice ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListInvoicesInput = z.input<typeof listInvoicesSchema>;
export type GetInvoiceInput = z.input<typeof getInvoiceSchema>;

export type InvoiceRow = {
  invoice_id: number;
  invoice_status: string | null;
  invoice_date: string | null;
  company_name: string | null;
  company_id: number | null;
  total: string | null;
  contract_type: string | null;
  transfer_id: number | null;
  currency_code: string | null;
};

export type InvoiceDetail = {
  invoice: {
    invoice_id: number;
    invoice_status: string | null;
    invoice_date: string | null;
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
  } | null;
  candidates: {
    tc_id: number;
    candidate_name: string | null;
    hours: number | null;
    amount: string | null;
    paid: number;
  }[];
  metrics: { label: string; value: string | number; note: string }[];
};

// ---------------------------------------------------------------------------
// listInvoices
// ---------------------------------------------------------------------------

/**
 * List invoices with pagination, filtering, and transfer info.
 */
export async function listInvoices(
  input: ListInvoicesInput = {},
): Promise<{
  items: InvoiceRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("finance.read");

  const parsed = listInvoicesSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, status, dateFrom, dateTo, companyId } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };
  if (status !== undefined) where.invoice_status = status;
  if (dateFrom !== undefined) {
    where.invoice_date = { ...(where.invoice_date as object || {}), gte: new Date(dateFrom) };
  }
  if (dateTo !== undefined) {
    where.invoice_date = { ...(where.invoice_date as object || {}), lte: new Date(dateTo) };
  }
  if (companyId !== undefined) {
    where.transfer = { company_id: companyId };
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where: where as any,
      orderBy: { invoice_date: "desc" },
      skip,
      take: limit,
      include: {
        transfer: {
          include: {
            company: { select: { company_name: true } },
          },
        },
      },
    }),
    prisma.invoice.count({ where: where as any }),
  ]);

  return {
    items: invoices.map((inv: any): InvoiceRow => ({
      invoice_id: inv.invoice_id,
      invoice_status: inv.invoice_status ?? null,
      invoice_date: inv.invoice_date?.toISOString() ?? null,
      company_name: inv.transfer?.company?.company_name ?? null,
      company_id: inv.transfer?.company_id ?? null,
      total: inv.transfer?.total ? inv.transfer.total.toString() : null,
      contract_type: inv.transfer?.contract_type ?? null,
      transfer_id: inv.transfer_id,
      currency_code: inv.transfer?.currency_code ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getInvoice
// ---------------------------------------------------------------------------

/**
 * Get a single invoice with transfer details and candidate payouts.
 */
export async function getInvoice(
  invoiceId: number,
): Promise<InvoiceDetail> {
  await requireCapability("finance.read");

  const parsed = getInvoiceSchema.safeParse({ invoiceId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invoice ID");
  }

  const invoice = await prisma.invoice.findFirst({
    where: { invoice_id: parsed.data.invoiceId, deleted: 0 },
    include: {
      transfer: {
        include: {
          company: { select: { company_name: true, company_email: true } },
          transfer_candidate: {
            where: { deleted: 0 },
            include: {
              candidate: { select: { candidate_name: true } },
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    return { invoice: null, candidates: [], metrics: [] };
  }

  const inv = invoice as any;
  const transfer = inv.transfer;

  const candidates = (transfer?.transfer_candidate ?? []).map((tc: any) => ({
    tc_id: tc.tc_id,
    candidate_name: tc.candidate
      ? `${tc.candidate.candidate_first_name ?? ""} ${tc.candidate.candidate_last_name ?? ""}`.trim()
      : null,
    hours: tc.hours ?? null,
    amount: tc.candidate_total ? tc.candidate_total.toString() : null,
    paid: tc.paid ?? 0,
  }));

  const metrics = [
    { label: "Invoice Status", value: inv.invoice_status ?? "—", note: "" },
    { label: "Candidate Payouts", value: candidates.length, note: "Candidates in transfer" },
    { label: "Transfer Status", value: transfer?.transfer_status === 10 ? "Open" : transfer?.transfer_status === 20 ? "Locked" : `Unknown (${transfer?.transfer_status})`, note: "" },
    { label: "Total", value: transfer?.total ? transfer.total.toString() : "—", note: transfer?.currency_code ?? "KWD" },
  ];

  return {
    invoice: {
      invoice_id: inv.invoice_id,
      invoice_status: inv.invoice_status ?? null,
      invoice_date: inv.invoice_date?.toISOString() ?? null,
      transfer: transfer
        ? {
            transfer_id: transfer.transfer_id,
            total: transfer.total ? transfer.total.toString() : null,
            company_total: transfer.company_total ? transfer.company_total.toString() : null,
            transfer_cost: transfer.transfer_cost ? transfer.transfer_cost.toString() : null,
            transfer_status: transfer.transfer_status,
            currency_code: transfer.currency_code ?? null,
            start_date: transfer.start_date?.toISOString() ?? null,
            end_date: transfer.end_date?.toISOString() ?? null,
            payment_received_on: transfer.payment_received_on?.toISOString() ?? null,
            transfer_created_at: transfer.transfer_created_at?.toISOString() ?? null,
            transfer_updated_at: transfer.transfer_updated_at?.toISOString() ?? null,
            company: transfer.company
              ? { company_name: transfer.company.company_name, company_email: transfer.company.company_email }
              : null,
          }
        : null,
    },
    candidates,
    metrics,
  };
}
