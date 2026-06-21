"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { CandidateEducationRow } from "../schemas";

type Props = {
  session: SessionUser;
  education: CandidateEducationRow[];
};

export function AdminCandidateEducationTable({ session, education }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Candidate Education — view education records across all candidates."
      metrics={[
        { label: "Total records", value: education.length, note: "Education entries in the system" },
      ]}
    >
      <DataTable
        title="Candidate Education"
        description="All education records. Search or filter by candidate name, university, degree, or major."
        rows={education.map((e) => ({ ...e, id: e.education_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "candidate_name",
            label: "Candidate",
            render: (row) => (
              <span className="font-medium text-foreground">
                {row.candidate_name ?? "—"}
              </span>
            ),
          },
          {
            key: "university_name",
            label: "University",
            render: (row) => row.university_name,
          },
          {
            key: "degree_name",
            label: "Degree",
            render: (row) => row.degree_name ?? "—",
          },
          {
            key: "major_name",
            label: "Major",
            render: (row) => row.major_name ?? "—",
          },
          {
            key: "graduation_year",
            label: "Graduation Year",
            render: (row) => row.graduation_year?.toString() ?? "—",
          },
          {
            key: "is_currently_studying",
            label: "Currently Studying",
            render: (row) => (row.is_currently_studying ? "Yes" : "No"),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
