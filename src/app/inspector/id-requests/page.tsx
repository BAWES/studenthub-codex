import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listIdRequests } from "./actions";

export const dynamic = "force-dynamic";

export default async function InspectorIdRequestsPage() {
  const session = await requireRoleCapability("inspector", "id_review.read");
  const { items: rows } = await listIdRequests({});

  return (
    <WorkspaceShell session={session} eyebrow="Inspector" title="ID Requests" metrics={[]}>
      <DataTablePage
        title="Civil ID Verification Queue"
        description="Batches from the legacy candidate ID request queue."
        rows={rows}
        rowHref={(row) => `/inspector/id-requests/${row.id}` as Route}
        searchable
        searchPlaceholder="Search by request, candidate, created by..."
        columns={[
          { key: "request", label: "Request", render: (row) => <strong>{row.request}</strong> },
          { key: "candidates", label: "Candidates", render: (row) => row.candidates },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(row.status)} label={row.status} size="sm" /> },
          { key: "createdBy", label: "Created By", render: (row) => row.createdBy },
          { key: "updatedBy", label: "Updated By", render: (row) => row.updatedBy },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
