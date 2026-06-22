// ---------------------------------------------------------------------------
// Admin CandidateIdRequest — server action re-exports (page-level delegates)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/candidate-account-requests/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listCandidateIdRequests,
  getCandidateIdRequest,
  updateCandidateIdRequestStatus,
} from "@/modules/admin/candidate-account-requests/actions";
