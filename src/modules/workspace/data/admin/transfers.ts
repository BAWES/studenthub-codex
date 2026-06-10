import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";

export async function getAdminTransferRows() {
  const rows = await prisma.transfer.findMany({
    where: { deleted: 0 },
    orderBy: { transfer_updated_at: "desc" },
    take: 60,
    select: {
      transfer_id: true,
      total: true,
      company_total: true,
      transfer_status: true,
      start_date: true,
      end_date: true,
      currency_code: true,
      company: { select: { company_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.transfer_id,
    company: row.company?.company_name ?? "No company",
    period: `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`,
    status: `Status ${row.transfer_status}`,
    total: formatMoney(row.total ?? row.company_total, row.currency_code ?? "KWD")
  }));
}

export async function getAdminTransferDetail(transferId: number) {
  const [transfer, candidates, invoices, fileEntries] = await prisma.$transaction([
    prisma.transfer.findUnique({
      where: { transfer_id: transferId },
      select: {
        transfer_id: true,
        total: true,
        company_total: true,
        transfer_cost: true,
        transfer_status: true,
        start_date: true,
        end_date: true,
        payment_received_on: true,
        transfer_created_at: true,
        transfer_updated_at: true,
        currency_code: true,
        company: { select: { company_name: true, company_email: true } },
        staff_transfer_transfer_created_byTostaff: { select: { staff_name: true } },
        staff_transfer_transfer_updated_byTostaff: { select: { staff_name: true } }
      }
    }),
    prisma.transfer_candidate.findMany({
      where: { transfer_id: transferId, deleted: 0 },
      orderBy: { tc_updated_at: "desc" },
      take: 80,
      select: {
        tc_id: true,
        candidate_total: true,
        company_total: true,
        transfer_cost: true,
        hours: true,
        minutes: true,
        paid: true,
        currency_code: true,
        candidate: { select: { candidate_name: true, candidate_email: true } },
        store: { select: { store_name: true } }
      }
    }),
    prisma.invoice.findMany({
      where: { transfer_id: transferId, deleted: 0 },
      orderBy: { invoice_date: "desc" },
      take: 20,
      select: { invoice_id: true, invoice_date: true, invoice_status: true }
    }),
    prisma.transfer_file_entry.findMany({
      where: { transfer: { transfer_id: transferId } },
      take: 20,
      select: {
        tfe_uuid: true,
        status: true,
        status_description: true,
        credit_amount: true,
        credit_currency: true,
        beneficiary_name: true
      }
    })
  ]);

  return {
    transfer,
    metrics: [
      { label: "Status", value: `Status ${transfer?.transfer_status ?? 0}`, note: "Legacy transfer status" },
      { label: "Total", value: formatMoney(transfer?.total ?? transfer?.company_total, transfer?.currency_code ?? "KWD"), note: "Transfer total" },
      { label: "Cost", value: formatMoney(transfer?.transfer_cost, transfer?.currency_code ?? "KWD"), note: "Transfer cost" },
      { label: "Candidates", value: candidates.length, note: "Candidate payout rows shown" }
    ],
    candidates: candidates.map((row) => ({
      id: row.tc_id,
      title: row.candidate?.candidate_name ?? "Unknown candidate",
      subtitle: row.store?.store_name ?? row.candidate?.candidate_email ?? "No store",
      meta: `${row.hours ?? 0}h ${row.minutes ?? 0}m · ${row.paid ? "Paid" : "Unpaid"} · ${formatMoney(row.candidate_total, row.currency_code ?? transfer?.currency_code ?? "KWD")}`
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.invoice_id,
      title: `Invoice #${invoice.invoice_id}`,
      subtitle: `${invoice.invoice_status ?? "No status"}`,
      meta: formatDate(invoice.invoice_date)
    })),
    fileEntries: fileEntries.map((entry) => ({
      id: entry.tfe_uuid,
      title: entry.beneficiary_name ?? "Transfer file entry",
      subtitle: entry.status_description ?? entry.status ?? "No status",
      meta: formatMoney(entry.credit_amount, entry.credit_currency ?? transfer?.currency_code ?? "KWD")
    }))
  };
}
