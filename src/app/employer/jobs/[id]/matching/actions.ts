// ---------------------------------------------------------------------------
// Employer Job Matching — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/employer/jobs/[id]/matching/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  getMatchingCandidates,
} from "@/modules/employer/jobs/[id]/matching/actions";
