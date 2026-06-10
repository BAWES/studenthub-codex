import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listRequests } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const session = await requireRoleCapability("admin", "request.read.any");
  const { items } = await listRequests({ limit: 60 });
  const rows = items.map((r) => ({
    id: r.request_uuid,
    title: r.title,
    company: r.company_name ?? "No company",
    owner: r.staff_name ?? "Unassigned",
    seats: r.no_of_employees ?? 0,
    status: r.status ?? "No status",
    updated: formatDate(r.updated_at ? new Date(r.updated_at) : null),
  }));

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Requests" metrics={[]}>
      <DataTable
        title="Request Pipeline"
        description="Newest operational demand across companies and assigned staff."
        rows={rows}
        rowHref={(row) => `/admin/requests/${row.id}` as Route}
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
