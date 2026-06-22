// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level [id] implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/currency/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep
// their current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getCurrency } from "@/modules/admin/currency/actions";
