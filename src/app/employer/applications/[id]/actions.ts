// ---------------------------------------------------------------------------
// Employer Application Detail — Re-exports (page-level imports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/employer/applications/actions.ts.
// Form actions (accept/reject/revert) live in actions.server.ts.
// This barrel just re-exports the data-fetching so page consumers keep their
// current import paths.
// ---------------------------------------------------------------------------

export {
  getApplicationDetail,
} from "@/modules/employer/applications/actions";
