// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level [id] implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/jobs/[id]/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getJob } from "@/modules/admin/jobs/[id]/actions";
