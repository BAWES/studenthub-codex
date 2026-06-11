"use server";

// ---------------------------------------------------------------------------
// Admin PaymentController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/PaymentController.php
//
// Actions:
//   - listPayments     — paginated list of bank transactions (payments)
//   - getPayment       — single payment detail with line items and contact
//
// bank_transaction status/type reflect Xero bank transaction terminology.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listPaymentsSchema,
  getPaymentSchema,
  listPaymentsOutputSchema,
  paymentDetailOutputSchema,
  type ListPaymentsInput,
  type GetPaymentInput,
  type PaymentRow,
  type PaymentDetail,
  type ListPaymentsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listPayments
// ---------------------------------------------------------------------------

/**
 * List bank transactions (payments) with pagination and optional filtering
 * by status, type, and date range.
 */
export async function listPayments(
  input: ListPaymentsInput = {},
): Promise<ListPaymentsResult> {
  await requireCapability("finance.read");

  const parsed = listPaymentsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, status, type, dateFrom, dateTo } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (status !== undefined) where.status = status;
  if (type !== undefined) where.type = type;
  if (dateFrom !== undefined || dateTo !== undefined) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom !== undefined) dateFilter.gte = new Date(dateFrom);
    if (dateTo !== undefined) dateFilter.lte = new Date(dateTo);
    where.date = dateFilter;
  }

  const [transactions, total] = await Promise.all([
    prisma.bank_transaction.findMany({
      where: where as any,
      orderBy: { date: "desc" },
      skip,
      take: limit,
      include: {
        bank_transaction_contact: {
          select: { contact_id: true, name: true },
        },
        bank_transaction_line_item: {
          select: { line_item_id: true },
        },
      },
    }),
    prisma.bank_transaction.count({ where: where as any }),
  ]);

  const result = {
    items: transactions.map((t: any): PaymentRow => ({
      bank_transaction_id: t.bank_transaction_id,
      reference: t.reference ?? null,
      status: t.status ?? null,
      type: t.type ?? null,
      total: t.total ?? null,
      currency_code: t.currency_code ?? null,
      contact_name: t.bank_transaction_contact?.name ?? null,
      date: t.date.toISOString(),
      is_reconciled: t.is_reconciled ?? null,
      line_items_count: t.bank_transaction_line_item?.length ?? 0,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listPaymentsOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/payments] listPayments output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getPayment
// ---------------------------------------------------------------------------

/**
 * Get a single bank transaction (payment) with line items and contact info.
 */
export async function getPayment(
  paymentId: string,
): Promise<PaymentDetail> {
  await requireCapability("finance.read");

  const parsed = getPaymentSchema.safeParse({ paymentId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid payment ID");
  }

  const transaction = await prisma.bank_transaction.findFirst({
    where: { bank_transaction_id: parsed.data.paymentId },
    include: {
      bank_transaction_contact: {
        select: { contact_id: true, name: true },
      },
      bank_transaction_line_item: {
        select: {
          line_item_id: true,
          account_code: true,
          description: true,
          line_amount: true,
          quantity: true,
          unit_amount: true,
        },
      },
    },
  });

  if (!transaction) {
    return { payment: null, line_items: [], metrics: [] };
  }

  const t = transaction as any;

  const line_items = (t.bank_transaction_line_item ?? []).map((li: any) => ({
    line_item_id: li.line_item_id,
    account_code: li.account_code ?? null,
    description: li.description ?? null,
    line_amount: li.line_amount ?? null,
    quantity: li.quantity ?? null,
    unit_amount: li.unit_amount ?? null,
  }));

  const metrics = [
    { label: "Line Items", value: line_items.length, note: "Transaction line entries" },
    { label: "Total", value: t.total ?? "—", note: t.currency_code ?? "KWD" },
    { label: "Status", value: t.status ?? "Unknown", note: "" },
    { label: "Type", value: t.type ?? "Unknown", note: "" },
    { label: "Reconciled", value: t.is_reconciled ? "Yes" : "No", note: "" },
  ];

  const result = {
    payment: {
      bank_transaction_id: t.bank_transaction_id,
      reference: t.reference ?? null,
      status: t.status ?? null,
      type: t.type ?? null,
      total: t.total ?? null,
      sub_total: t.sub_total ?? null,
      total_tax: t.total_tax ?? null,
      currency_rate: t.currency_rate ?? null,
      currency_code: t.currency_code ?? null,
      line_amount_types: t.line_amount_types ?? null,
      has_attachments: t.has_attachments ?? null,
      is_reconciled: t.is_reconciled ?? null,
      date: t.date?.toISOString() ?? null,
      created_at: t.created_at?.toISOString() ?? null,
      updated_at: t.updated_at?.toISOString() ?? null,
      contact: t.bank_transaction_contact
        ? {
            contact_id: t.bank_transaction_contact.contact_id,
            name: t.bank_transaction_contact.name,
          }
        : null,
    },
    line_items,
    metrics,
  };

  // Validate output shape
  const detailParsed = paymentDetailOutputSchema.safeParse(result);
  if (!detailParsed.success) {
    console.error(
      "[admin/payments] getPayment output validation failed:",
      detailParsed.error.issues,
    );
  }

  return result;
}
