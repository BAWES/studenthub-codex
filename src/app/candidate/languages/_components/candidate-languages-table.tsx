"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: number;
  language: string;
  proficiency: string;
  created_at: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateLanguagesTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Languages"
      metrics={[
        { label: "Total", value: rows.length, note: "Languages on your profile" },
      ]}
    >
      <DataTable
        title="Languages"
        description="Languages and proficiency levels associated with your candidate profile."
        rows={rows}
        rowHref="/candidate/languages/"
        columns={[
          { key: "language", label: "Language", render: (row) => <strong>{row.language}</strong> },
          { key: "proficiency", label: "Proficiency", render: (row) => row.proficiency },
          { key: "created_at", label: "Added", render: (row) => row.created_at },
        ]}
      />
    </WorkspaceShell>
  );
}
