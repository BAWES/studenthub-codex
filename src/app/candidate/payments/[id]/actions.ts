"use server";

// ---------------------------------------------------------------------------
// Barrel re-export — routes through the module-level wrappers
// ---------------------------------------------------------------------------

export {
  getPaymentAction as getPayment,
  deletePaymentAction as deletePayment,
} from "@/modules/candidates/payments/actions";
