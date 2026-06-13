// ---------------------------------------------------------------------------
// Admin StoreAssignmentRequest — server action re-exports (page-level delegates)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/user-requests/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listStoreAssignmentRequests,
  getStoreAssignmentRequest,
  updateStoreAssignmentRequestStatus,
} from "@/modules/admin/user-requests/actions";
