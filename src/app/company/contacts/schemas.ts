// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level schemas
// ---------------------------------------------------------------------------
// All schemas and types live in src/modules/company/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listCompanyContactsSchema,
  getCompanyContactSchema,
  createCompanyContactSchema,
  updateCompanyContactSchema,
  listCompanyContactsRowsSchema,
  companyContactListItemSchema,
  listCompanyContactsResultSchema,
  companyContactDetailSchema,
  companyContactUuidResultSchema,
  companyContactRowSchema,
} from "@/modules/company/schemas";

export type {
  ListCompanyContactsInput,
  CreateCompanyContactInput,
  UpdateCompanyContactInput,
  CompanyContactListItem,
  CompanyContactDetail,
  ListCompanyContactsResult,
  CompanyContactRow,
} from "@/modules/company/schemas";
