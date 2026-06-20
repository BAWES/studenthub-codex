// ---------------------------------------------------------------------------
// Staff — Candidates Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/staff/candidates/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listCandidates,
  getCandidateById,
} from "@/modules/staff/candidates/actions";
