// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/payments/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getPayment } from "@/modules/admin/payments/actions";
export type { PaymentDetail, GetPaymentInput } from "@/modules/admin/payments/schemas";
