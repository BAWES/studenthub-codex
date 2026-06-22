// ---------------------------------------------------------------------------
// Admin CandidateIdRequest schemas — re-exported from module layer
// ---------------------------------------------------------------------------

export {
  listCandidateIdRequestsSchema,
  getCandidateIdRequestSchema,
  updateCandidateIdRequestStatusSchema,
  candidateIdRequestRowSchema,
  listCandidateIdRequestsOutputSchema,
  getCandidateIdRequestOutputSchema,
  updateCandidateIdRequestStatusOutputSchema,
} from "@/modules/admin/candidate-account-requests/schemas";

export type {
  ListCandidateIdRequestsInput,
  GetCandidateIdRequestInput,
  UpdateCandidateIdRequestStatusInput,
  CandidateIdRequestRow,
  CandidateIdRequestDetail,
  UpdateCandidateIdRequestStatusResult,
} from "@/modules/admin/candidate-account-requests/schemas";
