"use server";

// ---------------------------------------------------------------------------
// Admin InvoiceController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/InvoiceController.php
//
// Actions:
//   - listInvoices     — paginated list of invoices with filters
//   - getInvoice       — single invoice detail with payment info and
//                        candidate payouts
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
  companyId: z.coerce.number().int().positive().optional(),
  status: z.enum(["paid", "unpaid"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
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
  transfer_id: number | null;
  company_name: string | null;
  invoice_date: string | null;
  invoice_status: string | null;
  total: string | null;
  currency_code: string | null;
};

export type InvoiceDetail = {
  invoice: {
    invoice_id: number;
    transfer_id: number | null;
    invoice_date: string | null;
    invoice_status: string | null;
    total: string | null;
    company_total: string | null;
    currency_code: string | null;
    payment_received_on: string | null;
    company: { company_name: string | null; company_email: string | null } | null;
  } | null;
  candidate_payouts: {
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
 * List all invoices with pagination, status, date, and company filtering.
 * Uses finance.read capability (inherited from transfer/invoice domain).
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

  const { page, limit, companyId, status, dateFrom, dateTo } = parsed.data;
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
          select: {
            transfer_id: true,
            total: true,
            currency_code: true,
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
      transfer_id: inv.transfer_id,
      company_name: inv.transfer?.company?.company_name ?? null,
      invoice_date: inv.invoice_date?.toISOString() ?? null,
      invoice_status: inv.invoice_status ?? null,
      total: inv.transfer?.total ? inv.transfer.total.toString() : null,
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
              candidate: {
                select: { candidate_first_name: true, candidate_last_name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!invoice || !invoice.transfer) {
    return { invoice: null, candidate_payouts: [], metrics: [] };
  }

  const inv = invoice as any;
  const t = inv.transfer as any;

  const candidatePayouts = (t.transfer_candidate ?? []).map((tc: any) => ({
    tc_id: tc.tc_id,
    candidate_name: tc.candidate
      ? `${tc.candidate.candidate_first_name ?? ""} ${tc.candidate.candidate_last_name ?? ""}`.trim()
      : null,
    hours: tc.hours ?? null,
    amount: tc.candidate_total ? tc.candidate_total.toString() : null,
    paid: tc.paid ?? 0,
  }));

  const totalAmount = t.total ? t.total.toString() : "—";
  const paidCount = candidatePayouts.filter((cp: any) => cp.paid === 1).length;

  const metrics = [
    { label: "Candidate Payouts", value: candidatePayouts.length, note: "Line items" },
    { label: "Paid", value: paidCount, note: `${candidatePayouts.length - paidCount} remaining` },
    { label: "Total", value: totalAmount, note: t.currency_code ?? "KWD" },
    { label: "Status", value: inv.invoice_status ?? "unpaid", note: "" },
  ];

  return {
    invoice: {
      invoice_id: inv.invoice_id,
      transfer_id: inv.transfer_id,
      invoice_date: inv.invoice_date?.toISOString() ?? null,
      invoice_status: inv.invoice_status ?? null,
      total: totalAmount,
      company_total: t.company_total ? t.company_total.toString() : null,
      currency_code: t.currency_code ?? null,
      payment_received_on: t.payment_received_on?.toISOString() ?? null,
      company: t.company
        ? { company_name: t.company.company_name, company_email: t.company.company_email }
        : null,
    },
    candidate_payouts: candidatePayouts,
    metrics,
  };
}
