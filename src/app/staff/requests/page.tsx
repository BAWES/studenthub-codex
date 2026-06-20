import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStaffRequestRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function StaffRequestsPage() {
  const session = await requireRoleCapability("staff", "request.read.assigned");
  const rows = await getStaffRequestRows(Number(session.id));

  return (
    <WorkspaceShell session={session} eyebrow="Staff" title="My Requests" metrics={[]}>
      <DataTable
        title="Assigned Request Pipeline"
        description="Requests currently connected to your staff account."
        rows={rows}
        rowHref={(row) => `/staff/requests/${row.id}` as Route}
        columns={[
          { key: "title", label: "Request", render: (row) => <strong>{row.title}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "seats", label: "Seats", render: (row) => row.seats },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
