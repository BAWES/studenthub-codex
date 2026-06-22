"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string | number;
  type: string;
  message: string;
  isNew: string;
  created: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateNotificationsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Notifications" metrics={[]}>
      <DataTable
        title="Notification History"
        description="Alerts and updates related to your candidate account."
        rows={rows}
        rowHref="/candidate/notifications/"
        columns={[
          { key: "type", label: "Type", render: (row) => <strong>{row.type}</strong> },
          { key: "message", label: "Message", render: (row) => row.message },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={row.isNew === "Unread" ? "info" : "neutral"} label={row.isNew} size="sm" /> },
          { key: "created", label: "Created", render: (row) => row.created }
        ]}
      />
    </WorkspaceShell>
  );
}
