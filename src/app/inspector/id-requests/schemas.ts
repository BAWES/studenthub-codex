// ---------------------------------------------------------------------------
// Inspector ID Requests — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/inspector/id-requests/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listIdRequestsSchema,
  getIdRequestSchema,
  updateIdRequestStatusSchema,
  type ListIdRequestsInput,
  type GetIdRequestInput,
  type UpdateIdRequestStatusInput,
  type IdRequestRow,
  type IdRequestDetail,
  type ListIdRequestsResult,
} from "@/modules/inspector/id-requests/schemas";
