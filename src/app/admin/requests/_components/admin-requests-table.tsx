"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  title: string;
  company: string;
  owner: string;
  seats: number;
  status: string;
  updated: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
  /** When true, renders skeleton shimmer rows instead of the table. */
  loading?: boolean;
};

export function AdminRequestsTable({ session, rows, loading }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Requests" metrics={[]}>
      <DataTable
        title="Request Pipeline"
        description="Newest operational demand across companies and assigned staff."
        rows={rows}
        rowHref="/admin/requests/"
        loading={loading}
        columns={[
          { key: "title", label: "Request", render: (row) => <strong>{row.title}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "owner", label: "Owner", render: (row) => row.owner },
          { key: "seats", label: "Seats", render: (row) => row.seats },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
