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
