// ---------------------------------------------------------------------------
// Admin CompanyRequest — server action re-exports (page-level delegates)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/company-requests/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listCompanyRequests,
  getCompanyRequest,
  updateCompanyRequestStatus,
} from "@/modules/admin/company-requests/actions";
