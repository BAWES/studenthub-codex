import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyWorkspace } from "./actions";

export const dynamic = "force-dynamic";

export default async function CompanyWorkspacePage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const data = await getCompanyWorkspace({ contactUuid: session.id });

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Company Workspace"
      title={`Welcome, ${data.contact?.contact_name ?? session.name}.`}
      metrics={data.metrics.map((m) => ({
        ...m,
        trend: "flat" as const,
      }))}
    >
      <div className="space-y-6" style={{ marginTop: "1.5rem" }}>
        {/* Linked Companies */}
        <DataTable
          title="Linked Companies"
          description="Companies linked to your contact account."
          rows={data.companies.map((c) => ({
            ...c,
            status: c.meta ?? "",
            updated: "",
          }))}
          rowHref="/company/workspace/"
          columns={[
            { key: "title", label: "Company", render: (row) => <strong>{row.title}</strong> },
            { key: "subtitle", label: "Position", render: (row) => row.subtitle },
            { key: "status", label: "Access", render: (row) => row.status ? <StatusBadge variant={genericStatusVariant(row.status)} label={row.status} size="sm" /> : null },
          ]}
        />

        {/* Recent Requests */}
        <DataTable
          title="Recent Requests"
          description="Latest hiring requests across your linked companies."
          rows={data.requests}
          rowHref="/company/requests/"
          columns={[
            { key: "title", label: "Position", render: (row) => <strong>{row.title}</strong> },
            { key: "subtitle", label: "Company", render: (row) => row.subtitle },
            { key: "meta", label: "Details", render: (row) => row.meta },
          ]}
        />
      </div>
    </WorkspaceShell>
  );
}
