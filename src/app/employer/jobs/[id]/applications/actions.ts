// ---------------------------------------------------------------------------
// Employer Job Applications — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/employer/jobs/[id]/applications/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listJobApplications,
  listJobApplicationsByEmployer,
  updateApplicationStatus,
} from "@/modules/employer/jobs/[id]/applications/actions";
