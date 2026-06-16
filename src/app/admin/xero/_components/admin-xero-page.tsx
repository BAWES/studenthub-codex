"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { BankTransactionItem, ReconciliationStatus } from "@/modules/admin/xero/schemas";

type Props = {
  session: SessionUser;
  transactions: BankTransactionItem[];
  total: number;
  reconciliation: ReconciliationStatus;
};

export function AdminXeroPage({ session, transactions, total, reconciliation }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Xero Bank Transactions — view and reconcile incoming transactions synced from Xero."
      metrics={[
        { label: "Total transactions", value: total, note: "Bank transactions in the system" },
        { label: "Reconciled", value: reconciliation.reconciledCount, note: `${reconciliation.reconciledPercentage}% of total` },
        { label: "Unreconciled", value: reconciliation.unreconciledCount, note: "Requires attention" },
      ]}
    >
      <DataTable
        title="Bank Transactions"
        description="All synced Xero bank transactions. Click a row to view details."
        rows={transactions.map((t) => ({ ...t, id: t.bankTransactionId }))}
        rowHref={undefined}
        columns={[
          {
            key: "reference",
            label: "Reference",
            render: (row) => (
              <span className="text-sm font-medium truncate block max-w-[200px]"
                style={{ color: "var(--sh-primary)" }}>
                {row.reference || "—"}
              </span>
            ),
          },
          {
            key: "type",
            label: "Type",
            render: (row) => (
              <span className="text-sm">{row.type || "—"}</span>
            ),
          },
          {
            key: "contactName",
            label: "Contact",
            render: (row) => (
              <span className="text-sm truncate block max-w-[180px]">
                {row.contactName || "—"}
              </span>
            ),
          },
          {
            key: "total",
            label: "Total",
            render: (row) => (
              <span className="text-sm font-mono">
                {row.total != null
                  ? `${Number(row.total).toFixed(3)} ${row.currencyCode ?? "KWD"}`
                  : "—"}
              </span>
            ),
          },
          {
            key: "isReconciled",
            label: "Status",
            render: (row) => (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: row.isReconciled ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  color: row.isReconciled ? "#22c55e" : "#ef4444",
                }}
              >
                {row.isReconciled ? "Reconciled" : "Unreconciled"}
              </span>
            ),
          },
          {
            key: "date",
            label: "Date",
            render: (row) => {
              if (!row.date) return "—";
              return new Date(row.date).toLocaleDateString();
            },
          },
          {
            key: "status",
            label: "Xero Status",
            render: (row) => (
              <span className="text-sm">{row.status || "—"}</span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
