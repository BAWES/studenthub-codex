"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getInvoiceDetail(invoiceId: number) {
  await requireRoleCapability("admin", "admin.system");

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
        },
      },
    },
  });

  return invoice;
}

export async function updateInvoice(
  invoiceId: number,
  data: {
    invoice_date?: Date | null;
    invoice_status?: "paid" | "unpaid" | null;
    transfer_id?: number | null;
  },
) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.invoice.update({
    where: { invoice_id: invoiceId },
    data: {
      invoice_date: data.invoice_date ?? undefined,
      invoice_status: data.invoice_status ?? undefined,
      transfer_id: data.transfer_id ?? undefined,
    },
  });

  revalidatePath("/admin/invoices");
}

export async function deleteInvoice(invoiceId: number) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.invoice.update({
    where: { invoice_id: invoiceId },
    data: { deleted: 1 },
  });

  revalidatePath("/admin/invoices");
}
