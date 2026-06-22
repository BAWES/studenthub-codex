// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level schemas
// ---------------------------------------------------------------------------
// All dashboard schema definitions live in
// src/modules/admin/dashboard-schemas.ts.
// ---------------------------------------------------------------------------

export {
  adminCompanyRowSchema,
  adminRequestRowSchema,
  adminTransferRowSchema,
  adminCandidateRowSchema,
  adminMetricSchema,
  adminTransferCandidateSchema,
  adminTransferInvoiceSchema,
  adminTransferFileEntrySchema,
  adminTransferDetailSchema,
  adminCompanyRowListSchema,
  adminRequestRowListSchema,
  adminTransferRowListSchema,
  adminCandidateRowListSchema,
} from "@/modules/admin/dashboard-schemas";

export type {
  AdminCompanyRow,
  AdminRequestRow,
  AdminTransferRow,
  AdminCandidateRow,
  AdminMetric,
  AdminTransferCandidate,
  AdminTransferInvoice,
  AdminTransferFileEntry,
  AdminTransferDetail,
} from "@/modules/admin/dashboard-schemas";
