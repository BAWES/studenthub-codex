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
