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
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listInvoicesSchema,
  getInvoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
  listInvoicesOutputSchema,
  invoiceDetailOutputSchema,
  invoiceMutationOutputSchema,
} from "./schemas";
import type {
  ListInvoicesInput,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  DeleteInvoiceInput,
  InvoiceRow,
  InvoiceDetail,
} from "./schemas";

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

  const result = {
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

  // Validate output shape
  const outputParsed = listInvoicesOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/invoices] listInvoices output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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
                select: { candidate_name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!invoice || !(invoice as any).transfer) {
    return { invoice: null, candidate_payouts: [], metrics: [] };
  }

  const inv = invoice as any;
  const t = inv.transfer as any;

  const candidatePayouts = (t.transfer_candidate ?? []).map((tc: any) => ({
    tc_id: tc.tc_id,
    candidate_name: tc.candidate
      ? tc.candidate.candidate_name ?? null
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

  const result = {
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

  // Validate output shape
  const detailParsed = invoiceDetailOutputSchema.safeParse(result);
  if (!detailParsed.success) {
    console.error(
      "[admin/invoices] getInvoice output validation failed:",
      detailParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createInvoice
// ---------------------------------------------------------------------------

/**
 * Create a new invoice record.
 * Uses finance.write capability.
 */
export async function createInvoice(
  data: CreateInvoiceInput,
): Promise<{ invoice_id: number }> {
  await requireCapability("finance.write");

  const parsed = createInvoiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invoice data");
  }

  const invoice = await prisma.invoice.create({
    data: {
      transfer_id: parsed.data.transfer_id ?? null,
      invoice_date: parsed.data.invoice_date ? new Date(parsed.data.invoice_date) : null,
      invoice_status: parsed.data.invoice_status,
    },
  });

  revalidatePath("/admin/invoices");
  const result = { invoice_id: invoice.invoice_id };

  // Validate output shape
  const createParsed = invoiceMutationOutputSchema.safeParse(result);
  if (!createParsed.success) {
    console.error(
      "[admin/invoices] createInvoice output validation failed:",
      createParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateInvoice
// ---------------------------------------------------------------------------

/**
 * Update an existing invoice's fields.
 * All mutation fields are optional — only provided fields are updated.
 */
export async function updateInvoice(
  data: UpdateInvoiceInput,
): Promise<{ invoice_id: number }> {
  await requireCapability("finance.write");

  const parsed = updateInvoiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invoice data");
  }

  const { invoiceId, ...fields } = parsed.data;

  const updateData: Record<string, unknown> = {};
  if (fields.transfer_id !== undefined) {
    updateData.transfer_id = fields.transfer_id;
  }
  if (fields.invoice_date !== undefined) {
    updateData.invoice_date = new Date(fields.invoice_date);
  }
  if (fields.invoice_status !== undefined) {
    updateData.invoice_status = fields.invoice_status;
  }

  await prisma.invoice.update({
    where: { invoice_id: invoiceId },
    data: updateData as any,
  });

  revalidatePath("/admin/invoices");
  const result = { invoice_id: invoiceId };

  // Validate output shape
  const updateParsed = invoiceMutationOutputSchema.safeParse(result);
  if (!updateParsed.success) {
    console.error(
      "[admin/invoices] updateInvoice output validation failed:",
      updateParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteInvoice
// ---------------------------------------------------------------------------

/**
 * Soft-delete an invoice by setting deleted=1.
 */
export async function deleteInvoice(
  data: DeleteInvoiceInput,
): Promise<{ invoice_id: number }> {
  await requireCapability("finance.write");

  const parsed = deleteInvoiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invoice ID");
  }

  await prisma.invoice.update({
    where: { invoice_id: parsed.data.invoiceId },
    data: { deleted: 1 },
  });

  revalidatePath("/admin/invoices");
  const result = { invoice_id: parsed.data.invoiceId };

  // Validate output shape
  const deleteParsed = invoiceMutationOutputSchema.safeParse(result);
  if (!deleteParsed.success) {
    console.error(
      "[admin/invoices] deleteInvoice output validation failed:",
      deleteParsed.error.issues,
    );
  }

  return result;
}
