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

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const getPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListPaymentsInput = z.input<typeof listPaymentsSchema>;
export type GetPaymentInput = z.input<typeof getPaymentSchema>;

export type PaymentRow = {
  bank_transaction_id: string;
  reference: string | null;
  status: string | null;
  type: string | null;
  total: number | null;
  currency_code: string | null;
  contact_name: string | null;
  date: string;
  is_reconciled: boolean | null;
  line_items_count: number;
};

export type PaymentDetail = {
  payment: {
    bank_transaction_id: string;
    reference: string | null;
    status: string | null;
    type: string | null;
    total: number | null;
    sub_total: number | null;
    total_tax: number | null;
    currency_rate: number | null;
    currency_code: string | null;
    line_amount_types: string | null;
    has_attachments: boolean | null;
    is_reconciled: boolean | null;
    date: string | null;
    created_at: string | null;
    updated_at: string | null;
    contact: { contact_id: string; name: string | null } | null;
  } | null;
  line_items: {
    line_item_id: string;
    account_code: string | null;
    description: string | null;
    line_amount: number | null;
    quantity: number | null;
    unit_amount: number | null;
  }[];
  metrics: { label: string; value: string | number; note: string }[];
};

export type ListPaymentsResult = {
  items: PaymentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaymentActionResponse = {
  operation: "success" | "error";
  message: string;
};

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

  return {
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

  return {
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
}
