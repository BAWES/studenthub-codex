// ---------------------------------------------------------------------------
// Staff — Requests Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/staff/requests/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  VALID_REQUEST_STATUSES,
  listStaffRequestsSchema,
  getStaffRequestDetailSchema,
  updateRequestStatusSchema,
  staffRequestRowOutputSchema,
  staffRequestListOutputSchema,
  requestCandidateOutputSchema,
  staffRequestDetailOutputSchema,
  updateRequestStatusOutputSchema,
  type ListStaffRequestsInput,
  type GetStaffRequestDetailInput,
  type UpdateRequestStatusInput,
  type StaffRequestRow,
  type StaffRequestDetail,
  type UpdateRequestStatusResult,
} from "@/modules/staff/requests/schemas";
