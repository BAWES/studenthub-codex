import type { Route } from "next";
import { requireRole } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateInvitationRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function CandidateInvitationsPage() {
  const session = await requireRole("candidate");
  const rows = await getCandidateInvitationRows(Number(session.id));

  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Invitations" metrics={[]}>
      <DataTable
        title="Invitation History"
        description="Requests and roles sent to your candidate account from the imported production data."
        rows={rows}
        rowHref={(row) => `/candidate/invitations/${row.id}` as Route}
        columns={[
          { key: "role", label: "Role", render: (row) => <strong>{row.role}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "compensation", label: "Compensation", render: (row) => row.compensation },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "seen", label: "Seen", render: (row) => row.seen },
          { key: "created", label: "Created", render: (row) => row.created }
        ]}
      />
    </WorkspaceShell>
  );
}
