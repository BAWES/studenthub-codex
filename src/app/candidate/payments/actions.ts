// ---------------------------------------------------------------------------
// Barrel re-export — routes through the module-level wrappers
// (No "use server" — the module-level actions already have it.)
// ---------------------------------------------------------------------------

export {
  listCandidatePaymentsAction as listCandidatePayments,
  getCandidatePaymentDetailAction as getCandidatePaymentDetail,
  createCandidatePaymentAction as createCandidatePayment,
  getPaymentMethodsAction as getPaymentMethods,
  getPaymentAction as getPayment,
  deletePaymentAction as deletePayment,
} from "@/modules/candidates/payments/actions";

// Re-export types for client components
export type { PaymentRow, ListPaymentsResult, PaymentDetail, GetPaymentDetailResult, PaymentMethod } from "./schemas";
