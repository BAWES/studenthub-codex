// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level schemas
// ---------------------------------------------------------------------------
// All schemas and types live in src/modules/company/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listCompanyRequestsSchema,
  getCompanyRequestDetailSchema,
  createCompanyRequestSchema,
  updateRequestStatusSchema,
  deleteRequestSchema,
  companyRequestListItemSchema,
  listCompanyRequestsResultSchema,
  companyRequestDetailSchema,
  companyRequestCreateResultSchema,
  companyRequestActionResultSchema,
} from "@/modules/company/schemas";

export type {
  ListCompanyRequestsInput,
  CreateCompanyRequestInput,
  UpdateRequestStatusInput,
  DeleteRequestInput,
  CompanyRequestListItem,
  CompanyRequestDetail,
  ListCompanyRequestsResult,
} from "@/modules/company/schemas";
