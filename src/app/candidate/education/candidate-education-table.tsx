"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  university: string;
  degree: string;
  major: string;
  graduation_year: number | null;
  is_currently_studying: boolean;
  created_at: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateEducationTable({ session, rows }: Props) {
  const activeCount = rows.filter((r) => r.is_currently_studying).length;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Education"
      metrics={[
        { label: "Total", value: rows.length, note: "Education entries on your profile" },
        { label: "Currently studying", value: activeCount, note: "Ongoing programs" },
      ]}
    >
      <DataTable
        title="Education History"
        description="Your academic background and qualifications."
        rows={rows}
        rowHref="/candidate/education/"
        columns={[
          {
            key: "university",
            label: "University",
            render: (row) => (
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                {row.university}
              </span>
            ),
          },
          {
            key: "degree",
            label: "Degree",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                {row.degree || "—"}
              </span>
            ),
          },
          {
            key: "major",
            label: "Major",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                {row.major || "—"}
              </span>
            ),
          },
          {
            key: "graduation_year",
            label: "Graduation",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.graduation_year ?? (row.is_currently_studying ? "Ongoing" : "—")}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Added",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {row.created_at}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
