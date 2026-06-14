// ---------------------------------------------------------------------------
// Admin Candidate Account Requests — Detail Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/candidate-account-requests/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  getCandidateIdRequest,
  updateCandidateIdRequestStatus,
} from "@/modules/admin/candidate-account-requests/actions";
