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

export function InspectorIdRequestsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Inspector" title="ID Requests" metrics={[]}>
      <DataTablePage
        title="Civil ID Verification Queue"
        description="Batches from the legacy candidate ID request queue."
        rows={rows}
        rowHref="/inspector/id-requests/"
        searchable
        searchPlaceholder="Search by request, candidate, created by..."
        columns={[
          { key: "request", label: "Request", render: (row) => <strong>{String(row.request)}</strong> },
          { key: "candidates", label: "Candidates", render: (row) => String(row.candidates) },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(String(row.status))} label={String(row.status)} size="sm" /> },
          { key: "createdBy", label: "Created By", render: (row) => String(row.createdBy) },
          { key: "updatedBy", label: "Updated By", render: (row) => String(row.updatedBy) },
          { key: "updated", label: "Updated", render: (row) => String(row.updated) }
        ]}
      />
    </WorkspaceShell>
  );
}
