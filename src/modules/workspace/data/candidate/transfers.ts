import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";

export async function getCandidateTransferRows(candidateId: number) {
  const rows = await prisma.transfer_candidate.findMany({
    where: { candidate_id: candidateId, deleted: 0 },
    orderBy: { tc_updated_at: "desc" },
    take: 80,
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
          transfer_status: true,
          start_date: true,
          end_date: true,
          payment_received_on: true,
          currency_code: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.tc_id,
    transferId: row.transfer_id,
    company: row.company?.company_name ?? row.store?.store_name ?? "No company",
    period: row.transfer?.start_date
      ? `${formatDate(row.transfer.start_date)} to ${formatDate(row.transfer.end_date)}`
      : "No period",
    hours: `${row.hours ?? 0}h ${row.minutes ?? 0}m`,
    candidateTotal: formatMoney(row.candidate_total, row.currency_code ?? row.transfer?.currency_code ?? "KWD"),
    companyTotal: formatMoney(row.company_total, row.currency_code ?? row.transfer?.currency_code ?? "KWD"),
    cost: formatMoney(row.transfer_cost, row.currency_code ?? row.transfer?.currency_code ?? "KWD"),
    paid: row.paid ? "Paid" : "Unpaid",
    transferStatus: `Transfer status ${row.transfer?.transfer_status ?? 0}`,
    paymentDate: row.transfer?.payment_received_on
      ? formatDate(row.transfer.payment_received_on)
      : "Not received",
    updated: formatDate(row.tc_updated_at),
  }));
}

export async function getCandidateTransferDetail(tcId: number, candidateId: number) {
  const tc = await prisma.transfer_candidate.findFirst({
    where: { tc_id: tcId, deleted: 0 },
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
          transfer_status: true,
          start_date: true,
          end_date: true,
          payment_received_on: true,
          transfer_created_at: true,
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

  return {
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
          status: t.transfer_status,
          period: t.start_date
            ? `${formatDate(t.start_date)} to ${formatDate(t.end_date)}`
            : "No period",
          paymentReceived: formatDate(t.payment_received_on),
          created: formatDate(t.transfer_created_at),
        }
      : null,
    invoices: (t?.invoice ?? []).map((inv: { invoice_id: number; invoice_date: Date | null; invoice_status: string | null }) => ({
      id: inv.invoice_id,
      title: `Invoice #${inv.invoice_id}`,
      subtitle: `${inv.invoice_status ?? "No status"}`,
      meta: formatDate(inv.invoice_date),
    })),
  };
}
