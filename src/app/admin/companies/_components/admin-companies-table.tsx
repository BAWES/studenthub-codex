"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { CompanyRow } from "../schemas";

type Props = {
  session: SessionUser;
  rows: CompanyRow[];
  /** When true, renders skeleton shimmer rows instead of the table. */
  loading?: boolean;
};

export function AdminCompaniesTable({ session, rows, loading }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Companies" metrics={[]}>
      <DataTable
        title="Company Accounts"
        description="Companies, ownership, active request counts, and commercial status."
        rows={rows}
        rowHref="/admin/companies/"
        loading={loading}
        columns={[
          { key: "name", label: "Company", render: (row) => <strong>{row.name}</strong> },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "owner", label: "Owner", render: (row) => row.owner },
          { key: "requests", label: "Requests", render: (row) => row.requests },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "updated", label: "Updated", render: (row) => row.updated },
        ]}
      />
    </WorkspaceShell>
  );
}
