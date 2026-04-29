import type { Route } from "next";
import { requireRole } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getInspectorIdRequestRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function InspectorIdRequestsPage() {
  const session = await requireRole("inspector");
  const rows = await getInspectorIdRequestRows();

  return (
    <WorkspaceShell session={session} eyebrow="Inspector" title="ID Requests" metrics={[]}>
      <DataTable
        title="Civil ID Verification Queue"
        description="Batches from the legacy candidate ID request queue."
        rows={rows}
        rowHref={(row) => `/inspector/id-requests/${row.id}` as Route}
        columns={[
          { key: "request", label: "Request", render: (row) => <strong>{row.request}</strong> },
          { key: "candidates", label: "Candidates", render: (row) => row.candidates },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "createdBy", label: "Created By", render: (row) => row.createdBy },
          { key: "updatedBy", label: "Updated By", render: (row) => row.updatedBy },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
