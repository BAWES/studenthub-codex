import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminStoryRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminStoryPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminStoryRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Stories" metrics={[]}>
      <DataTable
        title="Stories"
        description="Manage placement stories"
        rows={rows}
        rowHref={(row) => `/admin/story/${row.id}` as Route}
        columns={[
          { key: "request", label: "Request", render: (row) => <strong>{row.request}</strong> },
          { key: "staff", label: "Staff", render: (row) => row.staff },
          { key: "employees", label: "Employees", render: (row) => row.employees },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "time_spent", label: "Time Spent", render: (row) => row.time_spent },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
