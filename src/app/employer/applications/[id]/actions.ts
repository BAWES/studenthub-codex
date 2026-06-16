// ---------------------------------------------------------------------------
// Employer Application Detail — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/employer/applications/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep
// their current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  getApplicationDetail,
} from "@/modules/employer/applications/actions";
