"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  university: string;
  degree: string;
  major: string;
  graduationYear: string;
  status: string;
  created_at: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateEducationTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Education"
      metrics={[
        { label: "Total", value: rows.length, note: "Education records on your profile" },
      ]}
    >
      <DataTable
        title="Education"
        description="Your academic background and qualifications."
        rows={rows}
        rowHref="/candidate/education/"
        columns={[
          {
            key: "university",
            label: "University",
            render: (row) => <strong>{row.university}</strong>,
          },
          {
            key: "degree",
            label: "Degree",
            render: (row) => row.degree,
          },
          {
            key: "major",
            label: "Major",
            render: (row) => row.major,
          },
          {
            key: "graduationYear",
            label: "Graduation Year",
            render: (row) => row.graduationYear,
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  row.status === "Currently Studying"
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "bg-border/30 text-muted-foreground"
                }`}
              >
                {row.status}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Added",
            render: (row) => row.created_at,
          },
        ]}
      />
    </WorkspaceShell>
  );
}
