import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminJobRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminJobPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminJobRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Jobs" metrics={[]}>
      <DataTable
        title="Jobs"
        description="Manage job postings across the platform"
        rows={rows}
        rowHref={(row) => `/admin/job/${row.id}` as Route}
        columns={[
          { key: "position", label: "Position", render: (row) => <strong>{row.position}</strong> },
          { key: "area", label: "Area", render: (row) => row.area },
          { key: "compensation", label: "Compensation", render: (row) => row.compensation },
          { key: "hours", label: "Hours/Day", render: (row) => row.hours },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "updated", label: "Updated", render: (row) => row.updated },
        ]}
      />
    </WorkspaceShell>
  );
}
