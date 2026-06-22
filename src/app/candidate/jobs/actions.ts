// Colocated server actions — candidate job browsing & applications
// Delegates to module-level actions in @/modules/candidate/jobs/actions
// ---------------------------------------------------------------------------

export {
  listCandidateJobs,
  getCandidateJob,
  applyToJob,
  listMyApplications,
} from "@/modules/candidate/jobs/actions";

export type {
  CandidateJobRow,
  CandidateJobDetail,
  ApplicationRow,
} from "@/modules/candidate/jobs";
