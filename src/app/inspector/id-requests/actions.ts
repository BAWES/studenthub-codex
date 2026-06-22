// ---------------------------------------------------------------------------
// Inspector ID Requests — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/inspector/id-requests/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep
// their current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { listIdRequests, getIdRequest, approveIdRequest, rejectIdRequest } from "@/modules/inspector/id-requests/actions";
