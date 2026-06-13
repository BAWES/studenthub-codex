// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/transfers/[id]/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export * from "@/modules/admin/transfers/[id]/actions";
export { getAdminTransferDetail } from "@/modules/admin/transfers/actions";
