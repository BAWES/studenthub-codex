import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listCompanyAccountRows } from "./actions";

export const dynamic = "force-dynamic";

export default async function CompanyCompaniesPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const rows = await listCompanyAccountRows(session.id);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Linked Companies" metrics={[]}>
      <DataTable
        title="Company Accounts"
        description="Company records this contact can access through the imported production relationships."
        rows={rows}
        rowHref="/company/companies/"
        columns={[
          { key: "name", label: "Company", render: (row) => <strong>{row.name}</strong> },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "country", label: "Country", render: (row) => row.country },
          { key: "requests", label: "Requests", render: (row) => row.requests },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(row.status)} label={row.status} size="sm" /> },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
