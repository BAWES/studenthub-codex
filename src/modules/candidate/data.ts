// Re-export candidate workspace data functions for the candidate portal.
// Functions remain in workspace/data.ts — this barrel provides the target path
// for consumers to migrate their imports incrementally.
export {
  getCandidateWorkspace,
  getCandidateInvitationRows,
  getCandidateInvitationDetail,
  getCandidateWorkLogRows,
  getCandidateWorkLogDetail,
  getCandidateTransferRows,
  getCandidateTransferDetail,
} from "../workspace/data";
