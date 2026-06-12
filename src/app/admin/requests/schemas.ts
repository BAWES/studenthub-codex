// ---------------------------------------------------------------------------
// Admin Request schemas — re-exported from module layer
// ---------------------------------------------------------------------------

export {
  listRequestsSchema,
  getRequestSchema,
  updateRequestStatusSchema,
  approveRequestSchema,
  rejectRequestSchema,
  closeRequestSchema,
  listRequestsOutputSchema,
  getRequestOutputSchema,
  updateRequestStatusOutputSchema,
  approveRequestOutputSchema,
  rejectRequestOutputSchema,
  closeRequestOutputSchema,
} from "@/modules/admin/requests/schemas";

export type {
  ListRequestsInput,
  GetRequestInput,
  UpdateRequestStatusInput,
  ApproveRequestInput,
  RejectRequestInput,
  CloseRequestInput,
  RequestActionResponse,
  RequestRow,
  RequestDetail,
  UpdateRequestStatusResult,
} from "@/modules/admin/requests/schemas";
