// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level [id] implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/tags/[id]/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getTag } from "@/modules/admin/tags/[id]/actions";
