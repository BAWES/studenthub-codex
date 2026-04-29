import type { Route } from "next";
import { requireRole } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminCandidateRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminCandidatesPage() {
  const session = await requireRole("admin");
  const rows = await getAdminCandidateRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Candidates" metrics={[]}>
      <DataTable
        title="Candidate Directory"
        description="Latest production candidates from the imported local database."
        rows={rows}
        rowHref={(row) => `/admin/candidates/${row.id}` as Route}
        columns={[
          { key: "name", label: "Candidate", render: (row) => <strong>{row.name}</strong> },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "country", label: "Country", render: (row) => row.country },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "rate", label: "Rate", render: (row) => row.rate },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
