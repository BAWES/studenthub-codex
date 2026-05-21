import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStaffInterviewRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function StaffInterviewsPage() {
  const session = await requireRoleCapability("staff", "request.interview");
  const rows = await getStaffInterviewRows(Number(session.id));

  return (
    <WorkspaceShell session={session} eyebrow="Staff" title="Interviews" metrics={[]}>
      <DataTable
        title="Interview Pipeline"
        description="Interviews scheduled and managed by you."
        rows={rows}
        rowHref={(row) => `/staff/interviews/${row.id}` as Route}
        columns={[
          { key: "candidate", label: "Candidate", render: (row) => <strong>{row.candidate}</strong> },
          { key: "request", label: "Request", render: (row) => row.requestTitle },
          { key: "scheduled", label: "Scheduled", render: (row) => row.scheduledAt },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "note", label: "Note", render: (row) => row.note.slice(0, 80) }
        ]}
      />
    </WorkspaceShell>
  );
}
