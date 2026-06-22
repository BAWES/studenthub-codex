"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  candidate_name: string;
  store_name: string;
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

export function AdminUserRequestsTable({ session, rows, loading }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="User Requests" metrics={[]}>
      <DataTable
        title="Store Assignment Requests"
        description="User requests across candidates and stores."
        rows={rows}
        rowHref="/admin/user-requests/"
        loading={loading}
        columns={[
          { key: "candidate_name", label: "Candidate", render: (row) => <strong>{row.candidate_name || "—"}</strong> },
          { key: "store_name", label: "Store", render: (row) => row.store_name || "—" },
          { key: "currency_code", label: "Currency", render: (row) => row.currency_code || "—" },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "updated", label: "Updated", render: (row) => row.updated },
        ]}
      />
    </WorkspaceShell>
  );
}
