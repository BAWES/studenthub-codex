"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type JobRow = Record<string, unknown> & {
  id: string | number;
  title: string;
  employerName: string;
  employmentType?: string;
  location?: string;
  salaryRange?: string;
  createdAt: string;
};

type Props = {
  session: SessionUser;
  rows: JobRow[];
};

export function CandidateJobsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Browse Jobs"
      metrics={[
        { label: "Open Positions", value: rows.length, note: "active listings" },
      ]}
    >
      <DataTablePage
        title="Job Postings"
        description="Browse available job opportunities from employers."
        rows={rows}
        rowHref="/candidate/jobs/"
        searchable
        searchPlaceholder="Search by title, description..."
        columns={[
          { key: "title", label: "Title", render: (row) => <strong>{String(row.title)}</strong> },
          { key: "employerName", label: "Employer", render: (row) => String(row.employerName) },
          { key: "employmentType", label: "Type", render: (row) => row.employmentType ? String(row.employmentType) : "—" },
          { key: "location", label: "Location", render: (row) => row.location ? String(row.location) : "—" },
          { key: "salaryRange", label: "Salary", render: (row) => row.salaryRange ? String(row.salaryRange) : "—" },
          { key: "createdAt", label: "Posted", render: (row) => String(row.createdAt) },
        ]}
      />
    </WorkspaceShell>
  );
}
