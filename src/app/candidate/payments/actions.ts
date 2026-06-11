"use server";

// ---------------------------------------------------------------------------
// Candidate Payments — server actions for /candidate/payments
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/candidates/payments for
// listing, viewing, creating payments, and fetching payment methods.
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import {
  listCandidatePayments as moduleListPayments,
  getCandidatePaymentDetail as moduleGetPaymentDetail,
  createCandidatePayment as moduleCreatePayment,
  getPaymentMethods as moduleGetPaymentMethods,
} from "@/modules/candidates/payments/actions";
import {
  listPaymentsSchema,
  getPaymentDetailSchema,
  createPaymentSchema,
} from "./schemas";
import type {
  ListPaymentsParams,
  GetPaymentDetailParams,
  ListPaymentsResult,
  GetPaymentDetailResult,
  CreatePaymentInput,
  PaymentMethod,
} from "./schemas";

// Re-export types for client components
export type { PaymentRow, ListPaymentsResult, PaymentDetail, GetPaymentDetailResult, PaymentMethod } from "./schemas";

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List payment/transfer records for the current candidate.
 * Delegates to modules/candidates/payments with session candidate ID.
 */
export async function listCandidatePayments(
  params: FormData | ListPaymentsParams = {},
): Promise<ListPaymentsResult> {
  const session = await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? { page: params.get("page"), limit: params.get("limit") }
      : params;

  const parsed = listPaymentsSchema.safeParse(raw);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  return moduleListPayments(Number(session.id), parsed.data);
}

/**
 * Get a single payment/transfer detail for the current candidate.
 * Delegates to modules/candidates/payments with session candidate ID.
 */
export async function getCandidatePaymentDetail(
  params: GetPaymentDetailParams,
): Promise<GetPaymentDetailResult | null> {
  const session = await requireCapability("candidate.read.own");

  const parsed = getPaymentDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  return moduleGetPaymentDetail(Number(session.id), parsed.data.tcId);
}

/**
 * Create a transfer_candidate (payment) record with beneficiary details.
 * Delegates to modules/candidates/payments with session candidate ID.
 */
export async function createCandidatePayment(
  data: CreatePaymentInput,
): Promise<{ tcId: number }> {
  const session = await requireCapability("candidate.profile.edit");

  const parsed = createPaymentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid payment data");
  }

  return moduleCreatePayment(Number(session.id), parsed.data as { transferBenefName: string; transferBenefIban: string; bankId: number; amount?: number });
}

/**
 * Get the candidate's configured payment methods (bank accounts on file).
 * Delegates to modules/candidates/payments with session candidate ID.
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const session = await requireCapability("candidate.read.own");

  return moduleGetPaymentMethods(Number(session.id));
}
