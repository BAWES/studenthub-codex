// ---------------------------------------------------------------------------
// Admin CompanyRequest schemas — re-exported from module layer
// ---------------------------------------------------------------------------

export {
  listCompanyRequestsSchema,
  getCompanyRequestSchema,
  updateCompanyRequestStatusSchema,
  companyRequestRowSchema,
  listCompanyRequestsOutputSchema,
  getCompanyRequestOutputSchema,
  updateCompanyRequestStatusOutputSchema,
} from "@/modules/admin/company-requests/schemas";

export type {
  ListCompanyRequestsInput,
  GetCompanyRequestInput,
  UpdateCompanyRequestStatusInput,
  CompanyRequestRow,
  CompanyRequestDetail,
  UpdateCompanyRequestStatusResult,
} from "@/modules/admin/company-requests/schemas";
