import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listStaffRequests } from "./actions";

export const dynamic = "force-dynamic";

export default async function StaffRequestsPage() {
  const session = await requireRoleCapability("staff", "request.read.assigned");
  const result = await listStaffRequests({ limit: 60 });
  const rows = result.items;

  return (
    <WorkspaceShell session={session} eyebrow="Staff" title="My Requests" metrics={[]}>
      <DataTablePage
        title="Assigned Request Pipeline"
        description="Requests currently connected to your staff account."
        rows={rows}
        rowHref={(row) => `/staff/requests/${row.id}` as Route}
        searchable
        searchPlaceholder="Search by request title, company, status..."
        columns={[
          { key: "title", label: "Request", render: (row) => <strong>{row.title}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "seats", label: "Seats", render: (row) => row.seats },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(row.status)} label={row.status} size="sm" /> },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
