import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import { getInvoiceDetail } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;
  const invoiceId = Number(id);

  if (Number.isNaN(invoiceId)) {
    notFound();
  }

  const invoice = await getInvoiceDetail(invoiceId);

  if (!invoice) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Invoices"
      title={`Invoice #${invoice.invoice_id}`}
      metrics={[
        {
          label: "Status",
          value: invoice.invoice_status ?? "unknown",
          note: "Payment status",
        },
        {
          label: "Company",
          value: invoice.transfer?.company?.company_name ?? "—",
          note: "Billed company",
        },
      ]}
    >
      <FactPanel
        title="Invoice Details"
        facts={[
          { label: "Invoice ID", value: String(invoice.invoice_id) },
          {
            label: "Date",
            value: invoice.invoice_date ? formatDate(invoice.invoice_date) : "—",
          },
          {
            label: "Status",
            value: invoice.invoice_status ?? "—",
          },
          {
            label: "Transfer ID",
            value: invoice.transfer_id ? String(invoice.transfer_id) : "—",
          },
          {
            label: "Transfer Period",
            value:
              invoice.transfer?.start_date && invoice.transfer?.end_date
                ? `${formatDate(invoice.transfer.start_date)} to ${formatDate(invoice.transfer.end_date)}`
                : "—",
          },
          {
            label: "Total",
            value: formatMoney(
              invoice.transfer?.company_total ?? invoice.transfer?.total,
              invoice.transfer?.currency_code ?? "KWD",
            ),
          },
          {
            label: "Transfer Status",
            value: invoice.transfer?.transfer_status
              ? `Status ${invoice.transfer.transfer_status}`
              : "—",
          },
        ]}
      />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/invoices" as Route}>
          <Button variant="outline">Back to Invoices</Button>
        </Link>
        {invoice.transfer_id && (
          <Link href={`/admin/transfers/${invoice.transfer_id}` as Route}>
            <Button variant="ghost">View Transfer</Button>
          </Link>
        )}
      </section>
    </WorkspaceShell>
  );
}
