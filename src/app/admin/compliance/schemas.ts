// ---------------------------------------------------------------------------
// Admin — Compliance Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/admin/compliance/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listComplianceRecordsSchema,
  getComplianceRecordSchema,
  approveComplianceSchema,
  denyComplianceSchema,
  createComplianceRecordSchema,
  updateComplianceRecordSchema,
  complianceRowSchema,
  complianceSummarySchema,
  companyComplianceDetailSchema,
  idRequestComplianceDetailSchema,
  listComplianceRecordsResponseSchema,
  complianceMutationResponseSchema,
  type ListComplianceRecordsInput,
  type GetComplianceRecordInput,
  type ApproveComplianceInput,
  type DenyComplianceInput,
  type CreateComplianceRecordInput,
  type UpdateComplianceRecordInput,
  type ComplianceRow,
  type ComplianceSummary,
  type CompanyComplianceDetail,
  type IdRequestComplianceDetail,
  type ComplianceRowOutput,
  type ComplianceSummaryOutput,
  type CompanyComplianceDetailOutput,
  type IdRequestComplianceDetailOutput,
  type ListComplianceRecordsResponseOutput,
  type ComplianceMutationResponseOutput,
} from "@/modules/admin/compliance/schemas";
