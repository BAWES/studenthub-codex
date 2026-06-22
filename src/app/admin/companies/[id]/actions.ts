// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/companies/[id]/actions.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export * from "@/modules/admin/companies/[id]/actions";
