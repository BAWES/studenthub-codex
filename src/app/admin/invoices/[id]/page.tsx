import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getInvoice } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "finance.read");
  const { id } = await params;
  const invoiceId = Number(id);

  if (Number.isNaN(invoiceId)) {
    notFound();
  }

  const data = await getInvoice(invoiceId);

  if (!data.invoice) {
    notFound();
  }

  const { invoice, candidate_payouts, metrics } = data;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Invoices"
        title={`Invoice #${invoice.invoice_id}`}
        metrics={metrics}
      >
        <DetailSection
          title="Invoice Details"
          facts={[
            { label: "Invoice ID", value: String(invoice.invoice_id) },
            { label: "Transfer ID", value: invoice.transfer_id ? String(invoice.transfer_id) : "—" },
            { label: "Status", value: invoice.invoice_status ?? "—" },
            { label: "Total", value: invoice.total ?? "—" },
            { label: "Company Total", value: invoice.company_total ?? "—" },
            { label: "Currency", value: invoice.currency_code ?? "—" },
            { label: "Invoice Date", value: invoice.invoice_date ? formatDate(new Date(invoice.invoice_date)) : "—" },
            { label: "Payment Received", value: invoice.payment_received_on ? formatDate(new Date(invoice.payment_received_on)) : "—" },
          ]}
        />

        {invoice.company && (
          <DetailSection
            title="Company"
            facts={[
              { label: "Name", value: invoice.company.company_name ?? "—" },
              { label: "Email", value: invoice.company.company_email ?? "—" },
            ]}
          />
        )}

        {candidate_payouts.length > 0 && (
          <DetailSection
            title={`Candidate Payouts (${candidate_payouts.length})`}
            facts={candidate_payouts.map((cp, i) => ({
              label: `${i + 1}. ${cp.candidate_name ?? "Candidate #" + cp.tc_id}`,
              value: `${cp.amount ?? "—"}${cp.paid ? " ✓ Paid" : ""}`,
            }))}
          />
        )}

        <section className="flex gap-2 p-4">
          <Link href={"/admin/invoices" as Route}>
            <Button variant="outline">Back to Invoices</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
