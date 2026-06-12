// ---------------------------------------------------------------------------
// Admin — Compliance Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/compliance/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listComplianceRecords,
  getComplianceRecord,
  getComplianceSummary,
  createComplianceRecord,
  updateComplianceRecord,
  approveComplianceRecord,
  denyComplianceRecord,
} from "@/modules/admin/compliance/actions";
