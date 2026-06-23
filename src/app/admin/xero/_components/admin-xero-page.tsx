"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { BankTransactionItem, ReconciliationStatus } from "../schemas";

type Props = {
  session: SessionUser;
  transactions: BankTransactionItem[];
  reconciliation: ReconciliationStatus;
};

export function AdminXeroPage({ session, transactions, reconciliation }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Xero bank transactions — finance reconciliation and audit."
      metrics={[
        {
          label: "Reconciled",
          value: reconciliation.reconciledCount,
          note: `${reconciliation.reconciledPercentage.toFixed(1)}% of total`,
        },
        {
          label: "Unreconciled",
          value: reconciliation.unreconciledCount,
          note: "Requires attention",
        },
        {
          label: "Total",
          value: reconciliation.totalCount,
          note: "Bank transactions loaded",
        },
      ]}
    >
      <DataTable
        title="Bank Transactions"
        description="Xero-synced bank transactions with reconciliation status."
        searchable={true}
        rows={transactions.map((t) => ({ ...t, id: t.bankTransactionId }))}
        rowHref={undefined}
        columns={[
          {
            key: "bankTransactionId",
            label: "ID",
            render: (row) => (
              <code
                className="text-sm font-mono text-muted-foreground"
              >
                {row.bankTransactionId.slice(0, 8)}...
              </code>
            ),
          },
          {
            key: "contactName",
            label: "Contact",
            render: (row) => (
              <span
                className="text-sm text-foreground"
              >
                {row.contactName ?? "—"}
              </span>
            ),
          },
          {
            key: "reference",
            label: "Reference",
            render: (row) => (
              <span
                className="text-sm text-muted-foreground"
              >
                {row.reference ?? "—"}
              </span>
            ),
          },
          {
            key: "total",
            label: "Amount",
            render: (row) => (
              <span
                className="text-sm font-mono text-foreground"
              >
                {row.total != null
                  ? `${row.currencyCode ?? ""} ${row.total.toFixed(2)}`
                  : "—"}
              </span>
            ),
          },
          {
            key: "type",
            label: "Type",
            render: (row) => (
              <span
                className="text-sm text-foreground"
              >
                {row.type ?? "—"}
              </span>
            ),
          },
          {
            key: "isReconciled",
            label: "Status",
            render: (row) => (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  row.isReconciled
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {row.isReconciled ? "Reconciled" : "Unreconciled"}
              </span>
            ),
          },
          {
            key: "date",
            label: "Date",
            render: (row) => {
              const d = row.date ? new Date(row.date) : null;
              return (
                <span
                  className="text-sm text-muted-foreground"
                >
                  {d ? d.toLocaleDateString() : "—"}
                </span>
              );
            },
          },
        ]}
      />
    </WorkspaceShell>
  );
}
