"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// getInvoiceDetail — returns the full Prisma invoice object with transfer
// relations. Kept for backward compatibility with the [id]/page.tsx detail
// view which needs raw transfer fields (start_date, end_date, etc.).
// ---------------------------------------------------------------------------

export async function getInvoiceDetail(invoiceId: number) {
  await requireRoleCapability("admin", "admin.system");

  if (!invoiceId || invoiceId <= 0) {
    throw new Error("Invoice ID is required");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { invoice_id: invoiceId },
    include: {
      transfer: {
        select: {
          transfer_id: true,
          total: true,
          company_total: true,
          currency_code: true,
          transfer_status: true,
          start_date: true,
          end_date: true,
          company: { select: { company_id: true, company_name: true } },
        },
      },
    },
  });

  return invoice;
}

// ---------------------------------------------------------------------------
// listInvoices — paginated, filterable invoice listing
// ---------------------------------------------------------------------------

export async function listInvoices(input: {
  page?: number;
  limit?: number;
  companyId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  await requireRoleCapability("admin", "admin.system");

  const { page = 1, limit = 20, status, dateFrom, dateTo } = input;

  const where: Record<string, unknown> = { deleted: { not: 1 } };

  if (status) {
    where.invoice_status = status;
  }
  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);
    where.invoice_date = dateFilter;
  }

  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        transfer: {
          select: {
            total: true,
            currency_code: true,
            company: { select: { company_name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { invoice_id: "desc" },
    }),
    prisma.invoice.count({ where }),
  ]);

  const items = invoices.map((inv) => ({
    invoice_id: inv.invoice_id,
    transfer_id: inv.transfer_id,
    invoice_date: inv.invoice_date?.toISOString() ?? null,
    invoice_status: inv.invoice_status ?? null,
    company_name: inv.transfer?.company?.company_name ?? null,
    total: inv.transfer?.total?.toString() ?? null,
    currency_code: inv.transfer?.currency_code ?? null,
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / Math.max(limit, 1)),
  };
}

// ---------------------------------------------------------------------------
// getInvoice — full detail with payouts and metrics
// ---------------------------------------------------------------------------

export async function getInvoice(invoiceId: number) {
  await requireRoleCapability("admin", "admin.system");

  if (!invoiceId || invoiceId <= 0) {
    throw new Error("Invoice ID is required");
  }

  const invoice = await prisma.invoice.findFirst({
    where: { invoice_id: invoiceId },
    include: {
      transfer: {
        include: {
          company: { select: { company_name: true, company_email: true } },
          transfer_candidate: {
            where: { deleted: 0 },
            include: { candidate: { select: { candidate_name: true } } },
          },
        },
      },
    },
  });

  if (!invoice) {
    return { invoice: null, candidate_payouts: [], metrics: [] };
  }

  const t = invoice.transfer;

  // No transfer linked — return raw invoice data with empty payouts
  if (!t) {
    return {
      invoice: {
        invoice_id: invoice.invoice_id,
        transfer_id: invoice.transfer_id,
        invoice_date: invoice.invoice_date?.toISOString() ?? null,
        invoice_status: invoice.invoice_status ?? null,
        total: null,
        company_total: null,
        currency_code: null,
        payment_received_on: null,
        company: null,
      },
      candidate_payouts: [],
      metrics: [],
    };
  }

  const invoiceOutput = {
    invoice_id: invoice.invoice_id,
    transfer_id: invoice.transfer_id,
    invoice_date: invoice.invoice_date?.toISOString() ?? null,
    invoice_status: invoice.invoice_status ?? null,
    total: t.total?.toString() ?? null,
    company_total: t.company_total?.toString() ?? null,
    currency_code: t.currency_code ?? null,
    payment_received_on: t.payment_received_on?.toISOString() ?? null,
    company: t.company
      ? {
          company_name: t.company.company_name,
          company_email: t.company.company_email,
        }
      : null,
  };

  const candidate_payouts = (t.transfer_candidate ?? []).map((tc) => ({
    tc_id: tc.tc_id,
    candidate_name: tc.candidate?.candidate_name ?? null,
    hours: tc.hours ?? null,
    amount: tc.candidate_total?.toString() ?? null,
    paid: tc.paid,
  }));

  const totalAmount = t.total?.toString() ?? "0";
  const candidateCount = candidate_payouts.length;
  const paidPayouts = candidate_payouts.filter((cp) => cp.paid === 1);
  const unpaidPayouts = candidate_payouts.filter((cp) => cp.paid === 0);
  const paidAmount = paidPayouts.reduce(
    (sum, cp) => sum + (parseFloat(cp.amount ?? "0") || 0),
    0,
  );
  const unpaidAmount = unpaidPayouts.reduce(
    (sum, cp) => sum + (parseFloat(cp.amount ?? "0") || 0),
    0,
  );

  const metrics = [
    { label: "Total", value: totalAmount, note: t.currency_code ?? "KWD" },
    {
      label: "Paid",
      value: paidAmount.toFixed(3),
      note: `${paidPayouts.length} of ${candidateCount} candidates`,
    },
    {
      label: "Unpaid",
      value: unpaidAmount.toFixed(3),
      note: `${unpaidPayouts.length} of ${candidateCount} candidates`,
    },
    { label: "Candidates", value: candidateCount, note: "On this invoice" },
  ];

  return { invoice: invoiceOutput, candidate_payouts, metrics };
}

// ---------------------------------------------------------------------------
// createInvoice
// ---------------------------------------------------------------------------

export async function createInvoice(input: {
  transfer_id?: number;
  invoice_date?: string;
  invoice_status?: string;
}) {
  await requireRoleCapability("admin", "admin.system");

  const data: Record<string, unknown> = {
    invoice_status: input.invoice_status ?? "unpaid",
  };

  if (input.transfer_id !== undefined) {
    data.transfer_id = input.transfer_id;
  }
  if (input.invoice_date) {
    data.invoice_date = new Date(input.invoice_date);
  }

  const invoice = await prisma.invoice.create({ data: data as any });

  revalidatePath("/admin/invoices");

  return { invoice_id: invoice.invoice_id };
}

// ---------------------------------------------------------------------------
// updateInvoice
// ---------------------------------------------------------------------------

export async function updateInvoice(input: {
  invoiceId: number;
  transfer_id?: number;
  invoice_date?: string;
  invoice_status?: string;
}) {
  await requireRoleCapability("admin", "admin.system");

  if (!input.invoiceId || input.invoiceId <= 0) {
    throw new Error("Invoice ID is required");
  }

  const data: Record<string, unknown> = {};

  if (input.invoice_status !== undefined) {
    data.invoice_status = input.invoice_status;
  }
  if (input.transfer_id !== undefined) {
    data.transfer_id = input.transfer_id;
  }
  if (input.invoice_date !== undefined) {
    data.invoice_date = new Date(input.invoice_date);
  }

  await prisma.invoice.update({
    where: { invoice_id: input.invoiceId },
    data: data as any,
  });

  revalidatePath("/admin/invoices");

  return { invoice_id: input.invoiceId };
}

// ---------------------------------------------------------------------------
// deleteInvoice
// ---------------------------------------------------------------------------

export async function deleteInvoice(input: { invoiceId: number }) {
  await requireRoleCapability("admin", "admin.system");

  if (!input.invoiceId || input.invoiceId <= 0) {
    throw new Error("Invoice ID is required");
  }

  await prisma.invoice.update({
    where: { invoice_id: input.invoiceId },
    data: { deleted: 1 } as any,
  });

  revalidatePath("/admin/invoices");

  return { invoice_id: input.invoiceId };
}
