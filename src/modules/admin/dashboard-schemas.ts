import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin dashboard listing server actions
// ---------------------------------------------------------------------------

/**
 * Schema for the company row returned by listAdminCompanies.
 */
export const adminCompanyRowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Company name is required"),
  email: z.string().optional().default("No email"),
  owner: z.string().optional().default("Unassigned"),
  requests: z.number().int().nonnegative().default(0),
  status: z.string().min(1, "Status is required"),
  rate: z.string().min(1, "Rate is required"),
  updated: z.string().min(1, "Updated date is required"),
});

/**
 * Schema for the request row returned by listAdminRequests.
 */
export const adminRequestRowSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().optional().default("No company"),
  owner: z.string().optional().default("Unassigned"),
  seats: z.number().int().nonnegative().default(0),
  status: z.string().optional().default("No status"),
  updated: z.string().min(1, "Updated date is required"),
});

/**
 * Schema for the transfer row returned by listAdminTransfers.
 */
export const adminTransferRowSchema = z.object({
  id: z.number().int().positive(),
  company: z.string().optional().default("No company"),
  period: z.string().min(1, "Period is required"),
  status: z.string().min(1, "Status is required"),
  total: z.string().min(1, "Total is required"),
});

/**
 * Schema for the candidate row returned by listAdminCandidates.
 */
export const adminCandidateRowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  country: z.string().optional().default("No country"),
  status: z.string().min(1, "Status is required"),
  rate: z.string().min(1, "Rate is required"),
  updated: z.string().min(1, "Updated date is required"),
});

/**
 * Schema for a transfer metrics item.
 */
export const adminMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.union([z.string(), z.number()]).describe("Metric value can be string or number"),
  note: z.string().optional().default(""),
});

/**
 * Schema for a candidate in a transfer detail.
 */
export const adminTransferCandidateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, "Candidate name is required"),
  subtitle: z.string().optional().default("No store"),
  meta: z.string().optional().default(""),
});

/**
 * Schema for an invoice in a transfer detail.
 */
export const adminTransferInvoiceSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, "Invoice title is required"),
  subtitle: z.string().optional().default("No status"),
  meta: z.string().optional().default(""),
});

/**
 * Schema for a file entry in a transfer detail.
 */
export const adminTransferFileEntrySchema = z.object({
  id: z.string().min(1, "File entry ID is required"),
  title: z.string().optional().default("Transfer file entry"),
  subtitle: z.string().optional().default("No status"),
  meta: z.string().optional().default(""),
});

/**
 * Schema for the full transfer detail response.
 */
export const adminTransferDetailSchema = z.object({
  transfer: z.any().nullable(),
  metrics: z.array(adminMetricSchema),
  candidates: z.array(adminTransferCandidateSchema),
  invoices: z.array(adminTransferInvoiceSchema),
  fileEntries: z.array(adminTransferFileEntrySchema),
});

// ---------------------------------------------------------------------------
// Output validation — list schemas (array wrappers)
// ---------------------------------------------------------------------------

/**
 * Schema for the full companies array returned by listAdminCompanies.
 */
export const adminCompanyRowListSchema = z.array(adminCompanyRowSchema);

/**
 * Schema for the full requests array returned by listAdminRequests.
 */
export const adminRequestRowListSchema = z.array(adminRequestRowSchema);

/**
 * Schema for the full transfers array returned by listAdminTransfers.
 */
export const adminTransferRowListSchema = z.array(adminTransferRowSchema);

/**
 * Schema for the full candidates array returned by listAdminCandidates.
 */
export const adminCandidateRowListSchema = z.array(adminCandidateRowSchema);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminCompanyRow = z.input<typeof adminCompanyRowSchema>;
export type AdminRequestRow = z.input<typeof adminRequestRowSchema>;
export type AdminTransferRow = z.input<typeof adminTransferRowSchema>;
export type AdminCandidateRow = z.input<typeof adminCandidateRowSchema>;
export type AdminMetric = z.input<typeof adminMetricSchema>;
export type AdminTransferCandidate = z.input<typeof adminTransferCandidateSchema>;
export type AdminTransferInvoice = z.input<typeof adminTransferInvoiceSchema>;
export type AdminTransferFileEntry = z.input<typeof adminTransferFileEntrySchema>;
export type AdminTransferDetail = z.input<typeof adminTransferDetailSchema>;
