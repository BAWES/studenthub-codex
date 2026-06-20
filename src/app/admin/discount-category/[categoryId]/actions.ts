// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level [categoryId] implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/discount-category/[categoryId]/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getDiscountCategory } from "@/modules/admin/discount-category/[categoryId]/actions";
