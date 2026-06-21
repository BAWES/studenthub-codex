"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { CurrencyItem } from "../schemas";

type Props = {
  session: SessionUser;
  currencies: CurrencyItem[];
};

export function AdminCurrenciesTable({ session, currencies }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage currencies — supported currency codes and exchange rates."
      metrics={[
        {
          label: "Active currencies",
          value: currencies.filter((c) => c.status).length,
          note: `${currencies.length} total`,
        },
      ]}
    >
      <DataTable
        title="Currencies"
        description="Currency codes, symbols, and exchange rates used across the system."
        rows={currencies.map((c) => ({ ...c, id: String(c.currency_id) }))}
        rowHref={undefined}
        columns={[
          {
            key: "code",
            label: "Code",
            render: (row) => (
              <code className="text-sm font-mono font-semibold text-primary">
                {row.code}
              </code>
            ),
          },
          {
            key: "title",
            label: "Currency",
            render: (row) => (
              <span
                className="text-sm text-foreground"
              >
                {row.title}
              </span>
            ),
          },
          {
            key: "currency_symbol",
            label: "Symbol",
            render: (row) => (
              <span
                className="text-sm text-foreground"
              >
                {row.currency_symbol ?? "—"}
              </span>
            ),
          },
          {
            key: "rate",
            label: "Rate",
            render: (row) => (
              <span
                className="text-sm font-mono text-foreground"
              >
                {row.rate != null ? row.rate.toFixed(4) : "—"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  row.status
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-neutral-500/10 text-neutral-500"
                }`}
              >
                {row.status ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "sort_order",
            label: "Sort",
            render: (row) => (
              <span
                className="text-sm text-muted-foreground"
              >
                {row.sort_order ?? "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
