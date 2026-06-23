"use client";

import { DataTable, type DataTableColumn } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  company_name: string;
  contact_name: string;
  currency_code: string;
  status: string;
  updated: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
  /** When true, renders skeleton shimmer rows instead of the table. */
  loading?: boolean;
};

export function AdminCompanyRequestsTable({ session, rows, loading }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Company Requests" metrics={[]}>
      <DataTable
        title="Company Registration Requests"
        description="Company registration requests from candidates and contacts."
        rows={rows}
        rowHref="/admin/company-requests/"
        loading={loading}
        columns={[
          { key: "company_name", label: "Company", render: (row) => <strong>{row.company_name || "—"}</strong> },
          { key: "contact_name", label: "Contact", render: (row) => row.contact_name || "—" },
          { key: "currency_code", label: "Currency", render: (row) => row.currency_code || "—" },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "updated", label: "Updated", render: (row) => row.updated },
        ]}
      />
    </WorkspaceShell>
  );
}
