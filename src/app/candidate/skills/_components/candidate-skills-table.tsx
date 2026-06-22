"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: number;
  skill: string;
  created_at: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateSkillsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Skills"
      metrics={[
        { label: "Total", value: rows.length, note: "Skills on your profile" },
      ]}
    >
      <DataTable
        title="Skills"
        description="Skills and competencies associated with your candidate profile."
        rows={rows}
        rowHref="/candidate/skills/"
        columns={[
          { key: "skill", label: "Skill", render: (row) => <strong>{row.skill}</strong> },
          { key: "created_at", label: "Added", render: (row) => row.created_at },
        ]}
      />
    </WorkspaceShell>
  );
}
