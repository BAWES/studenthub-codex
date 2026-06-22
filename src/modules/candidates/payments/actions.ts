"use server";

// ---------------------------------------------------------------------------
// Module-level actions for candidate payments (transfers)
// ---------------------------------------------------------------------------
// Contains the real Prisma logic for listing, viewing, creating payments,
// and fetching payment methods. App router actions delegate to this.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";
import { formatMoney } from "@/modules/workspace/format";
import {
  listPaymentsSchema,
  getPaymentDetailSchema,
  createPaymentSchema,
  listPaymentsResultSchema,
  getPaymentDetailResultSchema,
  createPaymentResultSchema,
  paymentMethodSchema,
} from "./schemas";
import type {
  ListPaymentsResult,
  GetPaymentDetailResult,
  PaymentMethod,
  PaymentRow,
  PaymentDetail,
  PaymentDetailTransfer,
} from "./schemas";
import { revalidatePath } from "next/cache";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List payment/transfer records for a candidate (paginated).
 * Maps to the legacy getCandidateTransferRows function.
 */
export async function listCandidatePayments(
  candidateId: number,
  params?: { page?: number; limit?: number },
): Promise<ListPaymentsResult> {
  const parsed = listPaymentsSchema.safeParse(params ?? {});
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const where = { candidate_id: candidateId, deleted: 0 };

  const [rows, total] = await Promise.all([
    prisma.transfer_candidate.findMany({
      where: where as any,
      orderBy: { tc_updated_at: "desc" },
      skip,
      take: limit,
      select: {
        tc_id: true,
        transfer_id: true,
        candidate_total: true,
        company_total: true,
        transfer_cost: true,
        hours: true,
        minutes: true,
        paid: true,
        currency_code: true,
        tc_updated_at: true,
        company: { select: { company_name: true } },
        store: { select: { store_name: true } },
        transfer: {
          select: {
            start_date: true,
            end_date: true,
            payment_received_on: true,
            currency_code: true,
          },
        },
      },
    }),
    prisma.transfer_candidate.count({ where: where as any }),
  ]);

  const items = rows.map((row) => {
    const currency = row.currency_code ?? row.transfer?.currency_code ?? "KWD";
    return {
      id: row.tc_id,
      transferId: row.transfer_id,
      company: row.company?.company_name ?? row.store?.store_name ?? "No company",
      period: row.transfer?.start_date
        ? `${formatDate(row.transfer.start_date)} to ${formatDate(row.transfer.end_date)}`
        : "No period",
      hours: `${row.hours ?? 0}h ${row.minutes ?? 0}m`,
      candidateTotal: formatMoney(row.candidate_total, currency),
      companyTotal: formatMoney(row.company_total, currency),
      cost: formatMoney(row.transfer_cost, currency),
      paid: row.paid ? "Paid" : "Unpaid",
      paymentDate: row.transfer?.payment_received_on
        ? formatDate(row.transfer.payment_received_on)
        : "Not received",
      updated: formatDate(row.tc_updated_at),
    };
  });

  const result: ListPaymentsResult = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listPaymentsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/payments] listCandidatePayments output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single payment/transfer detail for a candidate.
 * Maps to the legacy getCandidateTransferDetail function.
 */
export async function getCandidatePaymentDetail(
  candidateId: number,
  tcId: number,
): Promise<GetPaymentDetailResult | null> {
  const parsed = getPaymentDetailSchema.safeParse({ tcId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const tc = await prisma.transfer_candidate.findFirst({
    where: { tc_id: parsed.data.tcId, deleted: 0 },
    select: {
      tc_id: true,
      candidate_id: true,
      transfer_id: true,
      candidate_total: true,
      company_total: true,
      transfer_cost: true,
      hours: true,
      minutes: true,
      paid: true,
      currency_code: true,
      candidate_hourly_rate: true,
      company_hourly_rate: true,
      bonus: true,
      transfer_benef_name: true,
      transfer_benef_iban: true,
      tc_created_at: true,
      tc_updated_at: true,
      store: { select: { store_name: true } },
      company: { select: { company_name: true } },
      bank: { select: { bank_name: true } },
      transfer: {
        select: {
          transfer_id: true,
          start_date: true,
          end_date: true,
          payment_received_on: true,
          currency_code: true,
          invoice: {
            where: { deleted: 0 },
            orderBy: { invoice_date: "desc" },
            select: { invoice_id: true, invoice_date: true, invoice_status: true },
          },
        },
      },
    },
  });

  if (!tc || tc.candidate_id !== candidateId) return null;

  const t = tc.transfer;
  const currency = tc.currency_code ?? t?.currency_code ?? "KWD";

  const result: GetPaymentDetailResult = {
    transferCandidate: {
      id: tc.tc_id,
      transferId: tc.transfer_id,
      company: tc.company?.company_name ?? "No company",
      store: tc.store?.store_name ?? null,
      hours: `${tc.hours ?? 0}h ${tc.minutes ?? 0}m`,
      hourlyRate: formatMoney(tc.candidate_hourly_rate, currency),
      candidateTotal: formatMoney(tc.candidate_total, currency),
      companyTotal: formatMoney(tc.company_total, currency),
      cost: formatMoney(tc.transfer_cost, currency),
      bonus: formatMoney(tc.bonus, currency),
      paid: tc.paid ? "Paid" : "Unpaid",
      beneficiary: tc.transfer_benef_name ?? null,
      iban: tc.transfer_benef_iban ?? null,
      bank: tc.bank?.bank_name ?? null,
      created: formatDate(tc.tc_created_at),
      updated: formatDate(tc.tc_updated_at),
    },
    transfer: t
      ? {
          id: t.transfer_id,
          period: t.start_date
            ? `${formatDate(t.start_date)} to ${formatDate(t.end_date)}`
            : "No period",
          paymentReceived: t.payment_received_on
            ? formatDate(t.payment_received_on)
            : "Not received",
        }
      : null,
    invoices: t?.invoice?.map((inv) => ({
      id: inv.invoice_id,
      date: inv.invoice_date,
      status: inv.invoice_status ?? null,
    })) ?? [],
  };

  // Validate output shape
  const outputParsed = getPaymentDetailResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/payments] getCandidatePaymentDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a transfer_candidate (payment) record with beneficiary details.
 */
export async function createCandidatePayment(
  candidateId: number,
  data: { transferBenefName: string; transferBenefIban: string; bankId: number; amount?: number },
): Promise<{ tcId: number }> {
  const parsed = createPaymentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid payment data");
  }

  const { transferBenefName, transferBenefIban, bankId, amount } = parsed.data;
  const now = new Date();

  const tc = await prisma.transfer_candidate.create({
    data: {
      candidate_id: candidateId,
      bank_id: bankId,
      transfer_benef_name: transferBenefName,
      transfer_benef_iban: transferBenefIban,
      candidate_total: amount ?? null,
      company_total: null,
      transfer_cost: null,
      hours: 0,
      minutes: 0,
      paid: 0,
      deleted: 0,
      tc_created_at: now,
      tc_updated_at: now,
      currency_code: "KWD",
    },
    select: { tc_id: true },
  });

  const result = { tcId: tc.tc_id };

  // Validate output shape
  const outputParsed = createPaymentResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/payments] createCandidatePayment output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get the candidate's configured payment methods (bank accounts on file).
 */
export async function getPaymentMethods(
  candidateId: number,
): Promise<PaymentMethod[]> {
  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: candidateId },
    select: {
      bank_id: true,
      bank_account_name: true,
      candidate_iban: true,
      bank: {
        select: {
          bank_name: true,
        },
      },
    },
  });

  if (!candidate || !candidate.bank_id) {
    return [];
  }

  const result: PaymentMethod[] = [
    {
      bankId: candidate.bank_id,
      bankName: candidate.bank?.bank_name ?? null,
      bankAccountName: candidate.bank_account_name ?? null,
      iban: candidate.candidate_iban ?? null,
    },
  ];

  // Validate output shape
  const outputParsed = paymentMethodSchema.array().safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/payments] getPaymentMethods output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ============================================================================
// Route-level wrappers (barrel re-export pattern)
// These define their own input schemas inline and handle session/auth.
// ============================================================================

// ---------------------------------------------------------------------------
// Inline schemas for route-level wrappers
// ---------------------------------------------------------------------------

const listPaymentsActionSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getPaymentDetailActionSchema = z.object({
  tcId: z.coerce.number().int().positive("Payment ID must be a positive integer"),
});

const createPaymentActionSchema = z.object({
  transferBenefName: z
    .string({ required_error: "Beneficiary name is required" })
    .min(1, "Beneficiary name is required")
    .max(60),
  transferBenefIban: z
    .string({ required_error: "IBAN is required" })
    .min(1, "IBAN is required")
    .max(50),
  bankId: z.number({ required_error: "Bank is required" }).int().positive(),
  amount: z.number().positive("Amount must be positive").optional(),
});

const getPaymentActionSchema = z.object({
  tcId: z.coerce.number().int().positive("Payment ID must be a positive integer"),
});

const deletePaymentActionSchema = z.object({
  tcId: z.coerce.number().int().positive("Payment ID must be a positive integer"),
});

// ---------------------------------------------------------------------------
// listCandidatePaymentsAction
// ---------------------------------------------------------------------------

/**
 * List payment/transfer records for the current candidate.
 * Route-level wrapper that handles session and delegates to listCandidatePayments.
 */
export async function listCandidatePaymentsAction(
  params: FormData | { page?: number; limit?: number } = {},
): Promise<ListPaymentsResult> {
  const session = await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? { page: params.get("page"), limit: params.get("limit") }
      : params;

  const parsed = listPaymentsActionSchema.safeParse(raw);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const result = await listCandidatePayments(Number(session.id), parsed.data);

  // Validate output shape
  const listOutputParsed = listPaymentsResultSchema.safeParse(result);
  if (!listOutputParsed.success) {
    console.error(
      "[modules/candidates/payments] listCandidatePaymentsAction output validation failed:",
      listOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCandidatePaymentDetailAction
// ---------------------------------------------------------------------------

/**
 * Get a single payment/transfer detail for the current candidate.
 * Route-level wrapper that handles session and delegates to getCandidatePaymentDetail.
 */
export async function getCandidatePaymentDetailAction(
  params: { tcId: string | number },
): Promise<GetPaymentDetailResult | null> {
  const session = await requireCapability("candidate.read.own");

  const parsed = getPaymentDetailActionSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await getCandidatePaymentDetail(Number(session.id), parsed.data.tcId);

  // Validate output shape (result can be null)
  const detailOutputParsed = getPaymentDetailResultSchema.nullable().safeParse(result);
  if (!detailOutputParsed.success) {
    console.error(
      "[modules/candidates/payments] getCandidatePaymentDetailAction output validation failed:",
      detailOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createCandidatePaymentAction
// ---------------------------------------------------------------------------

/**
 * Create a transfer_candidate (payment) record with beneficiary details.
 * Route-level wrapper that handles session and delegates to createCandidatePayment.
 */
export async function createCandidatePaymentAction(
  data: { transferBenefName: string; transferBenefIban: string; bankId: number; amount?: number },
): Promise<{ tcId: number }> {
  const session = await requireCapability("candidate.profile.edit");

  const parsed = createPaymentActionSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid payment data");
  }

  const result = await createCandidatePayment(
    Number(session.id),
    parsed.data as { transferBenefName: string; transferBenefIban: string; bankId: number; amount?: number },
  );

  // Validate output shape
  const createOutputParsed = createPaymentResultSchema.safeParse(result);
  if (!createOutputParsed.success) {
    console.error(
      "[modules/candidates/payments] createCandidatePaymentAction output validation failed:",
      createOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getPaymentMethodsAction
// ---------------------------------------------------------------------------

/**
 * Get the candidate's configured payment methods (bank accounts on file).
 * Route-level wrapper that handles session and delegates to getPaymentMethods.
 */
export async function getPaymentMethodsAction(): Promise<PaymentMethod[]> {
  const session = await requireCapability("candidate.read.own");

  const result = await getPaymentMethods(Number(session.id));

  // Validate output shape
  const methodsOutputParsed = paymentMethodSchema.array().safeParse(result);
  if (!methodsOutputParsed.success) {
    console.error(
      "[modules/candidates/payments] getPaymentMethodsAction output validation failed:",
      methodsOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getPaymentAction
// ---------------------------------------------------------------------------

/**
 * Get a single payment detail with full info (transfer, company, invoices).
 * Route-level wrapper for the [id] page that handles session and delegates
 * to getCandidatePaymentDetail.
 */
export async function getPaymentAction(
  tcId: number,
): Promise<GetPaymentDetailResult | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getPaymentActionSchema.safeParse({ tcId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid payment ID");
  }

  return getCandidatePaymentDetail(Number(session.id), parsed.data.tcId);
}

// ---------------------------------------------------------------------------
// deletePaymentAction
// ---------------------------------------------------------------------------

/**
 * Soft-delete a payment record by tc_id.
 * Only the owning candidate can delete their own payment records.
 *
 * Uses soft delete (sets deleted=1) following the existing pattern in
 * the list actions (where deleted=0 filters out soft-deleted rows).
 *
 * Returns `{ success: true }` on success, `{ success: false, error }` on error.
 */
export async function deletePaymentAction(
  tcId: number,
): Promise<{ success: true } | { success: false; error: string }> {
  const paymentActionResultSchema = z.discriminatedUnion("success", [
    z.object({ success: z.literal(true) }),
    z.object({ success: z.literal(false), error: z.string() }),
  ]);

  try {
    const session = await requireRoleCapability("candidate", "candidate.profile.edit");

    const parsed = deletePaymentActionSchema.safeParse({ tcId });
    if (!parsed.success) {
      return paymentActionResultSchema.parse({
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid payment ID",
      });
    }

    const candidateId = Number(session.id);

    // Verify ownership before soft-deleting
    const existing = await prisma.transfer_candidate.findFirst({
      where: {
        tc_id: parsed.data.tcId,
        candidate_id: candidateId,
        deleted: 0,
      },
      select: { tc_id: true },
    });

    const paymentExistenceSchema = z
      .object({ tc_id: z.number().int().positive() })
      .nullable();

    const existenceResult = paymentExistenceSchema.safeParse(existing);
    if (!existenceResult.success) {
      return paymentActionResultSchema.parse({
        success: false as const,
        error: "Payment not found or access denied",
      });
    }

    // Soft delete: set deleted flag
    await prisma.transfer_candidate.update({
      where: { tc_id: parsed.data.tcId },
      data: { deleted: 1 },
    });

    revalidatePath("/candidate/payments");

    return paymentActionResultSchema.parse({
      success: true as const,
    });
  } catch (e) {
    return paymentActionResultSchema.parse({
      success: false as const,
      error:
        e instanceof Error
          ? e.message
          : "Failed to delete payment.",
    });
  }
}
