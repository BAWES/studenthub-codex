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
// Types (derived from output validation schemas)
// ---------------------------------------------------------------------------

export type ListInvoicesInput = z.input<typeof listInvoicesSchema>;
export type GetInvoiceInput = z.input<typeof getInvoiceSchema>;
export type CreateInvoiceInput = z.input<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.input<typeof updateInvoiceSchema>;
export type DeleteInvoiceInput = z.input<typeof deleteInvoiceSchema>;

export type InvoiceRow = z.output<typeof invoiceRowOutputSchema>;
export type InvoiceDetail = z.output<typeof invoiceDetailOutputSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Validates a single invoice row returned in list results.
 */
export const invoiceRowOutputSchema = z.object({
  invoice_id: z.number().int(),
  transfer_id: z.number().int().nullable(),
  company_name: z.string().nullable(),
  invoice_date: z.string().nullable(),
  invoice_status: z.string().nullable(),
  total: z.string().nullable(),
  currency_code: z.string().nullable(),
});

/**
 * Validates the listInvoices return shape.
 */
export const listInvoicesOutputSchema = z.object({
  items: z.array(invoiceRowOutputSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Validates a single candidate payout entry.
 */
export const candidatePayoutOutputSchema = z.object({
  tc_id: z.number().int(),
  candidate_name: z.string().nullable(),
  hours: z.number().nullable(),
  amount: z.string().nullable(),
  paid: z.number().int(),
});

/**
 * Validates a metric entry.
 */
export const metricOutputSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

/**
 * Validates the nested invoice object within InvoiceDetail.
 */
export const invoiceNestedOutputSchema = z.object({
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
});

/**
 * Validates the getInvoice return shape.
 */
export const invoiceDetailOutputSchema = z.object({
  invoice: invoiceNestedOutputSchema.nullable(),
  candidate_payouts: z.array(candidatePayoutOutputSchema),
  metrics: z.array(metricOutputSchema),
});

/**
 * Validates mutation return shapes (create, update, delete).
 */
export const invoiceMutationOutputSchema = z.object({
  invoice_id: z.number().int(),
});
