import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyAccountRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function CompanyCompaniesPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const rows = await getCompanyAccountRows(session.id);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Linked Companies" metrics={[]}>
      <DataTable
        title="Company Accounts"
        description="Company records this contact can access through the imported production relationships."
        rows={rows}
        rowHref={(row) => `/company/companies/${row.id}` as Route}
        columns={[
          { key: "name", label: "Company", render: (row) => <strong>{row.name}</strong> },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "country", label: "Country", render: (row) => row.country },
          { key: "requests", label: "Requests", render: (row) => row.requests },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
