// ---------------------------------------------------------------------------
// Admin RequestController — server action re-exports (page-level delegates)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/requests/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listRequests,
  getRequest,
  updateRequestStatus,
  approveRequest,
  rejectRequest,
  closeRequest,
} from "@/modules/admin/requests/actions";
