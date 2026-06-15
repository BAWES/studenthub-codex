import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/transfers actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const listTransfersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().optional(),
});

export const getTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
});

export const approveTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
});

export const rejectTransferSchema = z.object({
  transferId: z.coerce.number().int().positive("Transfer ID is required"),
  reason: z.string().min(1, "Reason is required").max(500),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single transfer row in a list.
 */
export const transferRowSchema = z.object({
  id: z.number().int(),
  company: z.string(),
  period: z.string(),
  status: z.string(),
  statusCode: z.number().int(),
  total: z.string().nullable(),
  currencyCode: z.string().nullable(),
  createdAt: z.string().nullable(),
});

/**
 * Schema for listTransfers response.
 */
export const listTransfersResultSchema = z.object({
  items: z.array(transferRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for the transfer detail object within getTransferDetail.
 */
export const transferDetailTransferSchema = z
  .object({
    transferId: z.number().int(),
    total: z.string().nullable(),
    companyTotal: z.string().nullable(),
    transferCost: z.string().nullable(),
    status: z.string(),
    statusLabel: z.string(),
    currencyCode: z.string().nullable(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    paymentReceivedOn: z.string().nullable(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    companyName: z.string().nullable(),
    companyEmail: z.string().nullable(),
  })
  .nullable();

/**
 * Schema for a candidate payout entry in transfer detail.
 */
export const transferCandidateSchema = z.object({
  tcId: z.number().int(),
  candidateName: z.string().nullable(),
  hours: z.number().nullable(),
  amount: z.string().nullable(),
  paid: z.number().int(),
});

/**
 * Schema for an invoice entry in transfer detail.
 */
export const transferInvoiceSchema = z.object({
  invoiceId: z.number().int(),
  invoiceDate: z.string().nullable(),
  invoiceStatus: z.string().nullable(),
});

/**
 * Schema for a metric entry in transfer detail.
 */
export const transferMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  note: z.string(),
});

/**
 * Schema for getTransferDetail response.
 */
export const transferDetailResultSchema = z.object({
  transfer: transferDetailTransferSchema,
  candidates: z.array(transferCandidateSchema),
  invoices: z.array(transferInvoiceSchema),
  metrics: z.array(transferMetricSchema),
});

/**
 * Schema for approveTransfer / rejectTransfer responses.
 */
export const transferActionResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

/**
 * Schema for a candidate entry in the legacy admin transfer detail.
 */
export const adminTransferDetailCandidateSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string(),
});

/**
 * Schema for an invoice entry in the legacy admin transfer detail.
 */
export const adminTransferDetailInvoiceSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  subtitle: z.string(),
  meta: z.string(),
});

/**
 * Schema for the transfer object in the legacy admin transfer detail.
 */
export const adminTransferDetailTransferSchema = z
  .object({
    transfer_id: z.number().int(),
    total: z.string().nullable(),
    company_total: z.string().nullable(),
    transfer_cost: z.string().nullable(),
    transfer_status: z.number().int(),
    currency_code: z.string().nullable(),
    start_date: z.date().nullable(),
    end_date: z.date().nullable(),
    payment_received_on: z.date().nullable(),
    transfer_created_at: z.date(),
    transfer_updated_at: z.date(),
    company: z
      .object({
        company_name: z.string().nullable(),
        company_email: z.string().nullable(),
      })
      .nullable(),
    staff_transfer_transfer_created_byTostaff: z
      .object({ staff_name: z.string() })
      .nullable(),
    staff_transfer_transfer_updated_byTostaff: z
      .object({ staff_name: z.string() })
      .nullable(),
  })
  .nullable();

/**
 * Schema for getAdminTransferDetail response (legacy format).
 */
export const adminTransferDetailResultSchema = z.object({
  transfer: adminTransferDetailTransferSchema,
  candidates: z.array(adminTransferDetailCandidateSchema),
  invoices: z.array(adminTransferDetailInvoiceSchema),
  metrics: z.array(transferMetricSchema),
  fileEntries: z.array(z.never()),
});

// ---------------------------------------------------------------------------
// Inferred output types
// ---------------------------------------------------------------------------

export type TransferRow = z.output<typeof transferRowSchema>;
export type TransferDetail = z.output<typeof transferDetailResultSchema>;
export type TransferActionResponse = z.output<typeof transferActionResponseSchema>;
export type AdminTransferDetailCandidate = z.output<typeof adminTransferDetailCandidateSchema>;
export type AdminTransferDetailInvoice = z.output<typeof adminTransferDetailInvoiceSchema>;
export type AdminTransferDetailTransfer = z.output<typeof adminTransferDetailTransferSchema>;
export type AdminTransferDetailResult = z.output<typeof adminTransferDetailResultSchema>;

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type ListTransfersInput = z.input<typeof listTransfersSchema>;
export type GetTransferInput = z.input<typeof getTransferSchema>;
export type ApproveTransferInput = z.input<typeof approveTransferSchema>;
export type RejectTransferInput = z.input<typeof rejectTransferSchema>;
