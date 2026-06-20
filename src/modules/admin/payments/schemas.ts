import { z } from "zod";

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
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates a single payment row returned in list results.
 */
export const paymentRowOutputSchema = z.object({
  bank_transaction_id: z.string(),
  reference: z.string().nullable(),
  status: z.string().nullable(),
  type: z.string().nullable(),
  total: z.number().nullable(),
  currency_code: z.string().nullable(),
  contact_name: z.string().nullable(),
  date: z.string(),
  is_reconciled: z.boolean().nullable(),
  line_items_count: z.number().int().nonnegative(),
});

/**
 * Validates the listPayments return shape.
 */
export const listPaymentsOutputSchema = z.object({
  items: z.array(paymentRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Validates a line item entry within a payment detail.
 */
export const lineItemOutputSchema = z.object({
  line_item_id: z.string(),
  account_code: z.string().nullable(),
  description: z.string().nullable(),
  line_amount: z.number().nullable(),
  quantity: z.number().nullable(),
  unit_amount: z.number().nullable(),
});

/**
 * Validates the nested contact object within payment detail.
 */
export const paymentContactOutputSchema = z.object({
  contact_id: z.string(),
  name: z.string().nullable(),
});

/**
 * Validates the nested payment object within PaymentDetail.
 */
export const paymentNestedOutputSchema = z.object({
  bank_transaction_id: z.string(),
  reference: z.string().nullable(),
  status: z.string().nullable(),
  type: z.string().nullable(),
  total: z.number().nullable(),
  sub_total: z.number().nullable(),
  total_tax: z.number().nullable(),
  currency_rate: z.number().nullable(),
  currency_code: z.string().nullable(),
  line_amount_types: z.string().nullable(),
  has_attachments: z.boolean().nullable(),
  is_reconciled: z.boolean().nullable(),
  date: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  contact: paymentContactOutputSchema.nullable(),
});

/**
 * Reusable metric output schema (shared with invoices).
 */
export const metricOutputSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

/**
 * Validates the getPayment return shape.
 */
export const paymentDetailOutputSchema = z.object({
  payment: paymentNestedOutputSchema.nullable(),
  line_items: z.array(lineItemOutputSchema),
  metrics: z.array(metricOutputSchema),
});
