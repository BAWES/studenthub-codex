import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateInvitations } from "./actions";

export const dynamic = "force-dynamic";

export default async function CandidateInvitationsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listCandidateInvitations({});

  const rows = result.items.map((row) => ({
    id: row.invitation_uuid,
    role: row.position_title ?? "Invitation",
    company: row.company_name ?? "No company",
    compensation: row.compensation || "Not set",
    status: `Status ${row.invitation_status ?? 0}`,
    seen:
      row.invitation_app_seen_at || row.invitation_email_seen_at
        ? "Seen"
        : "Unseen",
    created: row.invitation_created_at
      ? formatDate(row.invitation_created_at)
      : "N/A",
  }));

  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Invitations" metrics={[]}>
      <DataTable
        title="Invitation History"
        description="Requests and roles sent to your candidate account from the imported production data."
        rows={rows}
        rowHref="/candidate/invitations/"
        columns={[
          { key: "role", label: "Role", render: (row) => <strong>{row.role}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "compensation", label: "Compensation", render: (row) => row.compensation },
          { key: "status", label: "Status", render: (row) => <StatusBadge variant={genericStatusVariant(row.status)} label={row.status} size="sm" /> },
          { key: "seen", label: "Seen", render: (row) => row.seen },
          { key: "created", label: "Created", render: (row) => row.created }
        ]}
      />
    </WorkspaceShell>
  );
}
