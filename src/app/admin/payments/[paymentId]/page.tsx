import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getPayment } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  AUTHORISED: "#22c55e",
  PAID: "#3b82f6",
  VOIDED: "#ef4444",
  DELETED: "#9ca3af",
  BILLED: "#f59e0b",
};

const TYPE_LABELS: Record<string, string> = {
  RECEIVE: "Receive",
  SPEND: "Spend",
};

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { paymentId } = await params;

  const data = await getPayment(paymentId);

  if (!data.payment) {
    notFound();
  }

  const p = data.payment;
  const statusColor = STATUS_COLORS[p.status ?? ""] ?? "#6b7280";
  const typeLabel = TYPE_LABELS[p.type ?? ""] ?? p.type ?? "—";

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Payments"
        title={`Payment ${p.bank_transaction_id.slice(0, 8)}…`}
        metrics={data.metrics}
      >
        <DetailSection
          title="Payment Details"
          facts={[
            { label: "Transaction ID", value: p.bank_transaction_id },
            { label: "Reference", value: p.reference ?? "—" },
            {
              label: "Status",
              value: (
                <span className="font-semibold" style={{ color: statusColor } as React.CSSProperties}>
                  {p.status ?? "Unknown"}
                </span>
              ) as any,
            },
            { label: "Type", value: typeLabel },
            {
              label: "Total",
              value: p.total != null ? `${Number(p.total).toFixed(3)} ${p.currency_code ?? "KWD"}` : "—",
            },
            {
              label: "Sub Total",
              value: p.sub_total != null ? `${Number(p.sub_total).toFixed(3)} ${p.currency_code ?? "KWD"}` : "—",
            },
            {
              label: "Total Tax",
              value: p.total_tax != null ? `${Number(p.total_tax).toFixed(3)} ${p.currency_code ?? "KWD"}` : "—",
            },
            { label: "Currency Rate", value: p.currency_rate != null ? String(p.currency_rate) : "—" },
            { label: "Line Amount Types", value: p.line_amount_types ?? "—" },
            {
              label: "Has Attachments",
              value: p.has_attachments ? "Yes" : "No",
            },
            {
              label: "Reconciled",
              value: p.is_reconciled ? "Yes" : "No",
            },
            {
              label: "Date",
              value: p.date ? formatDate(new Date(p.date)) : "—",
            },
            {
              label: "Created",
              value: p.created_at ? formatDate(new Date(p.created_at)) : "—",
            },
            {
              label: "Updated",
              value: p.updated_at ? formatDate(new Date(p.updated_at)) : "—",
            },
          ]}
        />

        {p.contact && (
          <DetailSection
            title="Contact"
            facts={[
              { label: "Contact ID", value: p.contact.contact_id },
              { label: "Name", value: p.contact.name ?? "—" },
            ]}
          />
        )}

        {data.line_items.length > 0 && (
          <DetailSection
            title={`Line Items (${data.line_items.length})`}
            facts={data.line_items.map((li, i) => ({
              label: `#${i + 1}${li.description ? ` — ${li.description}` : ""}`,
              value: [
                li.account_code ? `Account: ${li.account_code}` : "",
                li.quantity != null ? `Qty: ${li.quantity}` : "",
                li.unit_amount != null ? `@ ${Number(li.unit_amount).toFixed(3)}` : "",
                li.line_amount != null ? `= ${Number(li.line_amount).toFixed(3)}` : "",
              ]
                .filter(Boolean)
                .join(" | "),
            }))}
          />
        )}

        <section className="flex gap-2 p-4">
          <Link href={"/admin/payments" as Route}>
            <Button variant="outline">Back to Payments</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
