"use client";

import { DataTable, type DataTableColumn } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  candidate_ids: string;
  status: string;
  rejection_reason: string;
  created_by_name: string;
  updated: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
  /** When true, renders skeleton shimmer rows instead of the table. */
  loading?: boolean;
};

export function AdminCandidateAccountRequestsTable({ session, rows, loading }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Candidate Account Requests" metrics={[]}>
      <DataTable
        title="Candidate ID Requests"
        description="Requests for candidate account identification, with status tracking."
        rows={rows}
        rowHref="/admin/candidate-account-requests/"
        loading={loading}
        columns={[
          { key: "candidate_ids", label: "Candidate IDs", render: (row) => <strong>{row.candidate_ids || "—"}</strong> },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "rejection_reason", label: "Rejection Reason", render: (row) => row.rejection_reason || "—" },
          { key: "created_by_name", label: "Created By", render: (row) => row.created_by_name || "—" },
          { key: "updated", label: "Updated", render: (row) => row.updated },
        ]}
      />
    </WorkspaceShell>
  );
}
