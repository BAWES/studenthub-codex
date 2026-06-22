import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getBankTransaction } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminXeroDetailPage({
  params,
}: {
  params: Promise<{ bankTransactionId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { bankTransactionId } = await params;

  const tx = await getBankTransaction({ bankTransactionId });

  if (!tx) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Xero"
        title={`Transaction ${tx.reference || tx.bankTransactionId.slice(0, 8)}…`}
        metrics={[]}
      >
        <DetailSection
          title="Transaction Details"
          facts={[
            { label: "Bank Transaction ID", value: tx.bankTransactionId },
            { label: "Reference", value: tx.reference ?? "—" },
            { label: "Type", value: tx.type ?? "—" },
            { label: "Status", value: tx.status ?? "—" },
            {
              label: "Total",
              value: tx.total != null
                ? `${Number(tx.total).toFixed(3)} ${tx.currencyCode ?? "KWD"}`
                : "—",
            },
            {
              label: "Sub Total",
              value: tx.subTotal != null
                ? `${Number(tx.subTotal).toFixed(3)} ${tx.currencyCode ?? "KWD"}`
                : "—",
            },
            {
              label: "Total Tax",
              value: tx.totalTax != null
                ? `${Number(tx.totalTax).toFixed(3)} ${tx.currencyCode ?? "KWD"}`
                : "—",
            },
            { label: "Currency Rate", value: tx.currencyRate != null ? String(tx.currencyRate) : "—" },
            { label: "Line Amount Types", value: tx.lineAmountTypes ?? "—" },
            {
              label: "Reconciled",
              value: (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tx.isReconciled ? "text-success" : "text-destructive"}`}>
                  {tx.isReconciled ? "Yes" : "No"}
                </span>
              ),
            },
            { label: "Has Attachments", value: tx.hasAttachments ? "Yes" : "No" },
            {
              label: "Date",
              value: tx.date ? formatDate(new Date(tx.date)) : "—",
            },
            {
              label: "Created",
              value: tx.createdAt ? formatDate(new Date(tx.createdAt)) : "—",
            },
            {
              label: "Updated",
              value: tx.updatedAt ? formatDate(new Date(tx.updatedAt)) : "—",
            },
          ]}
        />

        {tx.contactName && (
          <DetailSection
            title="Contact"
            facts={[
              { label: "Contact ID", value: tx.contactId ?? "—" },
              { label: "Name", value: tx.contactName },
            ]}
          />
        )}

        {tx.lineItems.length > 0 && (
          <DetailSection
            title={`Line Items (${tx.lineItems.length})`}
            facts={tx.lineItems.map((li, i) => ({
              label: `#${i + 1}${li.description ? ` — ${li.description}` : ""}`,
              value: [
                li.accountCode ? `Account: ${li.accountCode}` : "",
                li.quantity != null ? `Qty: ${li.quantity}` : "",
                li.unitAmount != null ? `@ ${Number(li.unitAmount).toFixed(3)}` : "",
                li.lineAmount != null ? `= ${Number(li.lineAmount).toFixed(3)}` : "",
              ]
                .filter(Boolean)
                .join(" | "),
            }))}
          />
        )}

        {tx.url && (
          <DetailSection
            title="Xero Link"
            facts={[
              { label: "URL", value: tx.url },
            ]}
          />
        )}

        {tx.validationErrors && (
          <DetailSection
            title="Validation Errors"
            facts={[
              { label: "Errors", value: tx.validationErrors },
            ]}
          />
        )}

        <section className="flex gap-2 p-4">
          <Link href={"/admin/xero" as Route}>
            <Button variant="outline">Back to Transactions</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
