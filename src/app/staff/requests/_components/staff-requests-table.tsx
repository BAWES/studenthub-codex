"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = Record<string, unknown> & { id: string | number };

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function StaffRequestsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Staff" title="My Requests" metrics={[]}>
      <DataTablePage
        title="Assigned Request Pipeline"
        description="Requests currently connected to your staff account."
        rows={rows}
        rowHref="/staff/requests/"
        searchable
        searchPlaceholder="Search by request title, company, status..."
        columns={[
          { key: "title", label: "Request", render: (row) => <strong>{String(row.title)}</strong> },
          { key: "company", label: "Company", render: (row) => String(row.company) },
          { key: "seats", label: "Seats", render: (row) => String(row.seats) },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(String(row.status))} label={String(row.status)} size="sm" /> },
          { key: "updated", label: "Updated", render: (row) => String(row.updated) }
        ]}
      />
    </WorkspaceShell>
  );
}
