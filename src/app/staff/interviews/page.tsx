import { requireRoleCapability } from "@/modules/auth/session";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listStaffInterviews } from "./actions";

export const dynamic = "force-dynamic";

export default async function StaffInterviewsPage() {
  const session = await requireRoleCapability("staff", "request.interview");
  const result = await listStaffInterviews({ limit: 60 });
  const rows = result.items;

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
          { key: "candidate", label: "Candidate", render: (row) => <strong>{row.candidate}</strong> },
          { key: "request", label: "Request", render: (row) => row.requestTitle },
          { key: "scheduled", label: "Scheduled", render: (row) => row.scheduledAt },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(row.status)} label={row.status} size="sm" /> },
          { key: "note", label: "Note", render: (row) => row.note.slice(0, 80) }
        ]}
      />
    </WorkspaceShell>
  );
}
