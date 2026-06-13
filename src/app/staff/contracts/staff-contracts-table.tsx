"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type ContractRow = {
  id: string;
  contract_uuid: string;
  candidate_name: string | null;
  company_name: string | null;
  type: string;
  status_label: string;
  start_date: string | null;
  end_date: string | null;
  transfer_cost: string | null;
  currency_code: string | null;
  created_at: string | null;
};

type Props = {
  session: SessionUser;
  rows: ContractRow[];
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCost(cost: string | null, currency: string | null): string {
  if (!cost) return "—";
  const sym = currency === "KWD" ? "KD" : currency ?? "";
  const num = parseFloat(cost);
  if (isNaN(num)) return `${sym} ${cost}`;
  return `${sym} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function StaffContractsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Staff" title="Contracts" metrics={[]}>
      <DataTablePage
        title="Contract Pipeline"
        description="All contracts managed by StudentHub. Search or filter by contract type, company, or candidate."
        rows={rows}
        rowHref="/staff/contracts/"
        searchable
        searchPlaceholder="Search by candidate, company, contract type..."
        columns={[
          {
            key: "type",
            label: "Contract",
            render: (row) => <strong>{String(row.type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</strong>,
          },
          {
            key: "candidate_name",
            label: "Candidate",
            render: (row) => row.candidate_name ?? "—",
          },
          {
            key: "company_name",
            label: "Company",
            render: (row) => row.company_name ?? "—",
          },
          {
            key: "status_label",
            label: "Status",
            render: (row) => (
              <StatusBadge
                variant={genericStatusVariant(row.status_label)}
                label={row.status_label.charAt(0).toUpperCase() + row.status_label.slice(1)}
                size="sm"
              />
            ),
          },
          {
            key: "start_date",
            label: "Start",
            render: (row) => formatDate(row.start_date),
          },
          {
            key: "end_date",
            label: "End",
            render: (row) => formatDate(row.end_date),
          },
          {
            key: "transfer_cost",
            label: "Cost",
            render: (row) => formatCost(row.transfer_cost, row.currency_code),
          },
          {
            key: "created_at",
            label: "Created",
            render: (row) => formatDate(row.created_at),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
