import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateInvitations } from "./actions";
import { CandidateInvitationsTable } from "./candidate-invitations-table";

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

  return <CandidateInvitationsTable session={session} rows={rows} />;
}
