import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminRequestRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const session = await requireRoleCapability("admin", "request.read.any");
  const rows = await getAdminRequestRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Requests" metrics={[]}>
      <DataTablePage
        title="Request Pipeline"
        description="Newest operational demand across companies and assigned staff."
        rows={rows}
        rowHref={(row) => `/admin/requests/${row.id}` as Route}
        searchable
        searchPlaceholder="Search requests by title, company, or status..."
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
