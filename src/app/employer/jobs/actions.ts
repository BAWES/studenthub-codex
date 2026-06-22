// ---------------------------------------------------------------------------
// Employer Job Posting — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/employer/jobs/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  getMyEmployerId,
  listJobs,
  getJob,
  createJob,
  updateJob,
  closeJob,
  deleteJob,
} from "@/modules/employer/jobs/actions";
