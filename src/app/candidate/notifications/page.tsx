import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateNotificationRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function CandidateNotificationsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const rows = await getCandidateNotificationRows(Number(session.id));

  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Notifications" metrics={[]}>
      <DataTable
        title="Notification History"
        description="Alerts and updates related to your candidate account."
        rows={rows}
        rowHref={(row) => `/candidate/notifications/${row.id}` as Route}
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
