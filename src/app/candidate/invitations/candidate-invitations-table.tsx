"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  role: string;
  company: string;
  compensation: string;
  status: string;
  seen: string;
  created: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateInvitationsTable({ session, rows }: Props) {
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
