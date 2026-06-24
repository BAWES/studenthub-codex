"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listInvoices as _listInvoices,
  getInvoice as _getInvoice,
  createInvoice as _createInvoice,
  updateInvoice as _updateInvoice,
  deleteInvoice as _deleteInvoice,
} from "@/modules/admin/invoices/actions";
import type {
  ListInvoicesInput,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  DeleteInvoiceInput,
  InvoiceDetail,
} from "@/modules/admin/invoices/schemas";

// ---------------------------------------------------------------------------
// Re-export wrappers for list/detail/mutation server actions
// All business logic lives in src/modules/admin/invoices/actions.ts
// These wrappers apply admin-specific capability checks and keep the correct
// "use server" boundary for Next.js 15 (bare re-exports are forbidden).
// ---------------------------------------------------------------------------

export async function listInvoices(
  input: ListInvoicesInput = {},
): Promise<{
  items: Array<{
    invoice_id: number;
    transfer_id: number | null;
    company_name: string | null;
    invoice_date: string | null;
    invoice_status: string | null;
    total: string | null;
    currency_code: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireRoleCapability("admin", "admin.system");
  return _listInvoices(input);
}

export async function getInvoice(
  invoiceId: number,
): Promise<InvoiceDetail> {
  await requireRoleCapability("admin", "admin.system");
  return _getInvoice(invoiceId);
}

export async function createInvoice(
  data: CreateInvoiceInput,
): Promise<{ invoice_id: number }> {
  await requireRoleCapability("admin", "admin.system");
  return _createInvoice(data);
}

export async function updateInvoice(
  data: UpdateInvoiceInput,
): Promise<{ invoice_id: number }> {
  await requireRoleCapability("admin", "admin.system");
  return _updateInvoice(data);
}

export async function deleteInvoice(
  data: DeleteInvoiceInput,
): Promise<{ invoice_id: number }> {
  await requireRoleCapability("admin", "admin.system");
  return _deleteInvoice(data);
}

// ---------------------------------------------------------------------------
// getInvoiceDetail — used by [id]/page.tsx for full transfer details
// Calls getInvoice internally and extracts the nested invoice object so the
// detail page keeps its existing template (accesses invoice.invoice_id etc.).
// ---------------------------------------------------------------------------

export async function getInvoiceDetail(
  invoiceId: number,
): Promise<{
  invoice_id: number;
  transfer_id: number | null;
  invoice_date: string | null;
  invoice_status: string | null;
  total: string | null;
  company_total: string | null;
  currency_code: string | null;
  payment_received_on: string | null;
  company: { company_name: string | null; company_email: string | null } | null;
} | null> {
  await requireRoleCapability("admin", "admin.system");

  // Also check raw invoice for transfer details the detail page needs
  const invoice = await prisma.invoice.findUnique({
    where: { invoice_id: invoiceId },
    include: {
      transfer: {
        select: {
          transfer_id: true,
          total: true,
          company_total: true,
          currency_code: true,
          transfer_status: true,
          start_date: true,
          end_date: true,
          company: { select: { company_id: true, company_name: true } },
          payment_received_on: true,
        },
      },
    },
  });

  if (!invoice) return null;

  return {
    invoice_id: invoice.invoice_id,
    transfer_id: invoice.transfer_id,
    invoice_date: invoice.invoice_date?.toISOString() ?? null,
    invoice_status: invoice.invoice_status ?? null,
    total: invoice.transfer?.total ? invoice.transfer.total.toString() : null,
    company_total: invoice.transfer?.company_total ? invoice.transfer.company_total.toString() : null,
    currency_code: invoice.transfer?.currency_code ?? null,
    payment_received_on: invoice.transfer?.payment_received_on?.toISOString() ?? null,
    company: invoice.transfer?.company
      ? { company_name: invoice.transfer.company.company_name, company_email: null }
      : null,
  } as any;
}
