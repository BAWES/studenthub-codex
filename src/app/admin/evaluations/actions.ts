// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/evaluations/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export * from "@/modules/admin/evaluations/actions";
