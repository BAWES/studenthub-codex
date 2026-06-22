// ---------------------------------------------------------------------------
// Admin Dashboard — module-level data fetching
// ---------------------------------------------------------------------------
// Owns all Prisma queries and Zod output validation for the 5 admin listing
// functions. The app-level actions at src/app/admin/actions.ts import these
// and add capability checks via requireCapability().
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import {
  adminCompanyRowSchema,
  adminRequestRowSchema,
  adminTransferRowSchema,
  adminCandidateRowSchema,
  adminTransferDetailSchema,
  adminCompanyRowListSchema,
  adminRequestRowListSchema,
  adminTransferRowListSchema,
  adminCandidateRowListSchema,
} from "./dashboard-schemas";
import type {
  AdminCompanyRow,
  AdminRequestRow,
  AdminTransferRow,
  AdminCandidateRow,
  AdminTransferDetail,
} from "./dashboard-schemas";

// ---------------------------------------------------------------------------
// listAdminCompanies
// ---------------------------------------------------------------------------

/**
 * Fetch recent company rows for the admin dashboard.
 * No capability check — caller is responsible.
 */
export async function listAdminCompanies(): Promise<AdminCompanyRow[]> {
  const rows = await prisma.company.findMany({
    where: { deleted: 0 },
    orderBy: { company_updated_at: "desc" },
    take: 60,
    select: {
      company_id: true,
      company_name: true,
      company_email: true,
      no_of_active_requests: true,
      company_approved_to_hire: true,
      company_hourly_rate: true,
      currency_code: true,
      company_updated_at: true,
      staff: { select: { staff_name: true } },
    },
  });

  const result = rows.map((row) => ({
    id: row.company_id,
    name: row.company_name,
    email: row.company_email ?? "No email",
    owner: row.staff?.staff_name ?? "Unassigned",
    requests: row.no_of_active_requests ?? 0,
    status: row.company_approved_to_hire ? "Approved" : "Not approved",
    rate: formatMoney(row.company_hourly_rate, row.currency_code ?? "KWD"),
    updated: formatDate(row.company_updated_at),
  }));

  // Per-row output validation — log mismatches without throwing
  result.forEach((row) => {
    const parsed = adminCompanyRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[admin] listAdminCompanies row failed:", parsed.error.issues);
    }
  });

  // List-level output validation
  const listParsed = adminCompanyRowListSchema.safeParse(result);
  if (!listParsed.success) {
    console.error("[admin] listAdminCompanies list failed:", listParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// listAdminRequests
// ---------------------------------------------------------------------------

/**
 * Fetch recent request rows for the admin dashboard.
 * No capability check — caller is responsible.
 */
export async function listAdminRequests(): Promise<AdminRequestRow[]> {
  const rows = await prisma.request.findMany({
    orderBy: { request_updated_datetime: "desc" },
    take: 60,
    select: {
      request_uuid: true,
      request_position_title: true,
      request_status: true,
      request_number_of_employees: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } },
      staff: { select: { staff_name: true } },
    },
  });

  const result = rows.map((row) => ({
    id: row.request_uuid,
    title: row.request_position_title ?? "Untitled request",
    company: row.company?.company_name ?? "No company",
    owner: row.staff?.staff_name ?? "Unassigned",
    seats: row.request_number_of_employees ?? 0,
    status: row.request_status ?? "No status",
    updated: formatDate(row.request_updated_datetime),
  }));

  // Per-row output validation — log mismatches without throwing
  result.forEach((row) => {
    const parsed = adminRequestRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[admin] listAdminRequests row failed:", parsed.error.issues);
    }
  });

  // List-level output validation
  const listParsed = adminRequestRowListSchema.safeParse(result);
  if (!listParsed.success) {
    console.error("[admin] listAdminRequests list failed:", listParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// listAdminTransfers
// ---------------------------------------------------------------------------

/**
 * Fetch recent transfer rows for the admin dashboard.
 * No capability check — caller is responsible.
 */
export async function listAdminTransfers(): Promise<AdminTransferRow[]> {
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
      company: { select: { company_name: true } },
    },
  });

  const result = rows.map((row) => ({
    id: row.transfer_id,
    company: row.company?.company_name ?? "No company",
    period: `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`,
    status: `Status ${row.transfer_status}`,
    total: formatMoney(row.total ?? row.company_total, row.currency_code ?? "KWD"),
  }));

  // Per-row output validation — log mismatches without throwing
  result.forEach((row) => {
    const parsed = adminTransferRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[admin] listAdminTransfers row failed:", parsed.error.issues);
    }
  });

  // List-level output validation
  const listParsed = adminTransferRowListSchema.safeParse(result);
  if (!listParsed.success) {
    console.error("[admin] listAdminTransfers list failed:", listParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// listAdminCandidates
// ---------------------------------------------------------------------------

/**
 * Fetch recent candidate rows for the admin dashboard.
 * No capability check — caller is responsible.
 */
export async function listAdminCandidates(): Promise<AdminCandidateRow[]> {
  const rows = await prisma.candidate.findMany({
    where: { deleted: 0 },
    orderBy: { candidate_updated_at: "desc" },
    take: 60,
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_email: true,
      candidate_status: true,
      approved: true,
      candidate_hourly_rate: true,
      currency_code: true,
      candidate_updated_at: true,
      country: { select: { country_name_en: true } },
    },
  });

  const result = rows.map((row) => ({
    id: row.candidate_id,
    name: row.candidate_name,
    email: row.candidate_email,
    country: row.country?.country_name_en ?? "No country",
    status:
      row.approved === 0
        ? "Needs review"
        : row.candidate_status === 10
          ? "Active"
          : `Status ${row.candidate_status}`,
    rate: formatMoney(row.candidate_hourly_rate, row.currency_code ?? "KWD"),
    updated: formatDate(row.candidate_updated_at),
  }));

  // Per-row output validation — log mismatches without throwing
  result.forEach((row) => {
    const parsed = adminCandidateRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[admin] listAdminCandidates row failed:", parsed.error.issues);
    }
  });

  // List-level output validation
  const listParsed = adminCandidateRowListSchema.safeParse(result);
  if (!listParsed.success) {
    console.error("[admin] listAdminCandidates list failed:", listParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getTransferDetail
// ---------------------------------------------------------------------------

/**
 * Fetch full transfer detail by transfer ID.
 * No capability check — caller is responsible.
 */
export async function getTransferDetail(
  transferId: number,
): Promise<AdminTransferDetail> {
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
        staff_transfer_transfer_updated_byTostaff: { select: { staff_name: true } },
      },
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
        store: { select: { store_name: true } },
      },
    }),
    prisma.invoice.findMany({
      where: { transfer_id: transferId, deleted: 0 },
      orderBy: { invoice_date: "desc" },
      take: 20,
      select: { invoice_id: true, invoice_date: true, invoice_status: true },
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
        beneficiary_name: true,
      },
    }),
  ]);

  const result: AdminTransferDetail = {
    transfer,
    metrics: [
      {
        label: "Status",
        value: `Status ${transfer?.transfer_status ?? 0}`,
        note: "Legacy transfer status",
      },
      {
        label: "Total",
        value: formatMoney(
          transfer?.total ?? transfer?.company_total,
          transfer?.currency_code ?? "KWD",
        ),
        note: "Transfer total",
      },
      {
        label: "Cost",
        value: formatMoney(
          transfer?.transfer_cost,
          transfer?.currency_code ?? "KWD",
        ),
        note: "Transfer cost",
      },
      {
        label: "Candidates",
        value: candidates.length,
        note: "Candidate payout rows shown",
      },
    ],
    candidates: candidates.map((row) => ({
      id: row.tc_id,
      title: row.candidate?.candidate_name ?? "Unknown candidate",
      subtitle: row.store?.store_name ?? row.candidate?.candidate_email ?? "No store",
      meta: `${row.hours ?? 0}h ${row.minutes ?? 0}m · ${row.paid ? "Paid" : "Unpaid"} · ${formatMoney(row.candidate_total, row.currency_code ?? transfer?.currency_code ?? "KWD")}`,
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.invoice_id,
      title: `Invoice #${invoice.invoice_id}`,
      subtitle: `${invoice.invoice_status ?? "No status"}`,
      meta: formatDate(invoice.invoice_date),
    })),
    fileEntries: fileEntries.map((entry) => ({
      id: entry.tfe_uuid,
      title: entry.beneficiary_name ?? "Transfer file entry",
      subtitle: entry.status_description ?? entry.status ?? "No status",
      meta: formatMoney(
        entry.credit_amount,
        entry.credit_currency ?? transfer?.currency_code ?? "KWD",
      ),
    })),
  };

  // Output validation — log mismatches without throwing
  const parsed = adminTransferDetailSchema.safeParse(result);
  if (!parsed.success) {
    console.error("[admin] getTransferDetail output validation failed:", parsed.error.issues);
  }

  return result;
}
