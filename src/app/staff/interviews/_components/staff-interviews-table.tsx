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

export function StaffInterviewsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Staff" title="Interviews" metrics={[]}>
      <DataTablePage
        title="Interview Pipeline"
        description="Interviews scheduled and managed by you."
        rows={rows}
        rowHref="/staff/interviews/"
        searchable
        searchPlaceholder="Search by candidate, request, status..."
        columns={[
          { key: "candidate", label: "Candidate", render: (row) => <strong>{String(row.candidate)}</strong> },
          { key: "request", label: "Request", render: (row) => String(row.requestTitle) },
          { key: "scheduled", label: "Scheduled", render: (row) => String(row.scheduledAt) },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(String(row.status))} label={String(row.status)} size="sm" /> },
          { key: "note", label: "Note", render: (row) => String(row.note).slice(0, 80) }
        ]}
      />
    </WorkspaceShell>
  );
}
