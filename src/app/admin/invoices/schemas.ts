import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/invoices actions
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

export const createInvoiceSchema = z.object({
  transfer_id: z.number().int().positive().optional(),
  invoice_date: z.string().optional(),
  invoice_status: z.enum(["paid", "unpaid"]).optional().default("unpaid"),
});

export const updateInvoiceSchema = z.object({
  invoiceId: z.coerce.number().int().positive("Invoice ID is required"),
  transfer_id: z.number().int().positive().optional(),
  invoice_date: z.string().optional(),
  invoice_status: z.enum(["paid", "unpaid"]).optional(),
});

export const deleteInvoiceSchema = z.object({
  invoiceId: z.coerce.number().int().positive("Invoice ID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single invoice row in the listing.
 */
export const invoiceRowSchema = z.object({
  invoice_id: z.number().int().positive(),
  transfer_id: z.number().int().positive().nullable(),
  company_name: z.string().nullable(),
  invoice_date: z.string().nullable(),
  invoice_status: z.string().nullable(),
  total: z.string().nullable(),
  currency_code: z.string().nullable(),
});

/**
 * Schema for a candidate payout item in invoice detail.
 */
const invoiceCandidatePayoutSchema = z.object({
  tc_id: z.number().int(),
  candidate_name: z.string().nullable(),
  hours: z.number().nullable(),
  amount: z.string().nullable(),
  paid: z.number().int(),
});

/**
 * Schema for a metric in the invoice detail.
 */
const invoiceMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

/**
 * Schema for the invoice detail response from getInvoice.
 */
export const invoiceDetailSchema = z.object({
  invoice: z
    .object({
      invoice_id: z.number().int(),
      transfer_id: z.number().int().nullable(),
      invoice_date: z.string().nullable(),
      invoice_status: z.string().nullable(),
      total: z.string().nullable(),
      company_total: z.string().nullable(),
      currency_code: z.string().nullable(),
      payment_received_on: z.string().nullable(),
      company: z
        .object({
          company_name: z.string().nullable(),
          company_email: z.string().nullable(),
        })
        .nullable(),
    })
    .nullable(),
  candidate_payouts: z.array(invoiceCandidatePayoutSchema),
  metrics: z.array(invoiceMetricSchema),
});

/**
 * Schema for the full list response from listInvoices.
 */
export const listInvoicesResultSchema = z.object({
  items: z.array(invoiceRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for mutation action responses (create, update, delete).
 */
export const invoiceActionResponseSchema = z.object({
  invoice_id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListInvoicesInput = z.input<typeof listInvoicesSchema>;
export type GetInvoiceInput = z.input<typeof getInvoiceSchema>;
export type CreateInvoiceInput = z.input<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.input<typeof updateInvoiceSchema>;
export type DeleteInvoiceInput = z.input<typeof deleteInvoiceSchema>;

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
