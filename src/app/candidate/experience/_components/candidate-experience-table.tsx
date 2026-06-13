"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: number;
  experience: string;
  employer: string;
  period: string;
  created_at: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateExperienceTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Experience"
      metrics={[
        { label: "Total", value: rows.length, note: "Experience entries on your profile" },
      ]}
    >
      <DataTable
        title="Work Experience"
        description="Your work history and professional experience."
        rows={rows}
        rowHref="/candidate/experience/"
        columns={[
          { key: "experience", label: "Position", render: (row) => <strong>{row.experience}</strong> },
          { key: "employer", label: "Employer", render: (row) => row.employer },
          { key: "period", label: "Period", render: (row) => row.period },
          { key: "created_at", label: "Added", render: (row) => row.created_at },
        ]}
      />
    </WorkspaceShell>
  );
}
