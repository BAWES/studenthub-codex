"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  name: string;
  company: string;
  position: string;
  created_at: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateReferencesTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="References"
      metrics={[
        { label: "Total", value: rows.length, note: "References on your profile" },
      ]}
    >
      <DataTable
        title="References"
        description="Professional references associated with your candidate profile."
        rows={rows}
        rowHref="/candidate/references/"
        columns={[
          { key: "name", label: "Name", render: (row) => <strong>{row.name}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "position", label: "Position", render: (row) => row.position },
          { key: "created_at", label: "Added", render: (row) => row.created_at },
        ]}
      />
    </WorkspaceShell>
  );
}
