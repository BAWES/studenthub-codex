"use server";

// ---------------------------------------------------------------------------
// Admin RequestController — server actions (page-level delegates)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/requests/actions.ts.
// This file re-exports module-level actions so page consumers
// (and the [id] sub-page) keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listRequests,
  getRequest,
  updateRequestStatus,
  approveRequest,
  rejectRequest,
  closeRequest,
} from "@/modules/admin/requests/actions";
