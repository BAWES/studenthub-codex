// ---------------------------------------------------------------------------
// Staff — Requests Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/staff/requests/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listStaffRequests,
  getStaffRequestDetail,
  updateRequestStatus,
} from "@/modules/staff/requests/actions";
