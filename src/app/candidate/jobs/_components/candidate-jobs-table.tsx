"use client";

import Link from "next/link";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { MatchScoreBadge } from "@/components/matching";
import type { SessionUser } from "@/modules/auth/types";

type JobRow = Record<string, unknown> & {
  id: string | number;
  title: string;
  employerName: string;
  employmentType: string;
  location: string;
  salaryRange: string;
  createdAt: string;
  matchScore?: number | null;
};

type Props = {
  session: SessionUser;
  rows: JobRow[];
  total: number;
};

export function CandidateJobsTable({ session, rows, total }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Job Opportunities"
      metrics={[
        { label: "Total Listings", value: total, note: "active jobs" },
        { label: "Full-Time", value: rows.filter((r) => r.employmentType === "full-time").length, note: "positions" },
        { label: "Part-Time", value: rows.filter((r) => r.employmentType === "part-time").length, note: "positions" },
      ]}
    >
      <DataTablePage
        title="Job Opportunities"
        description="Browse and apply to posted job listings from partner employers."
        rows={rows}
        rowHref="/candidate/jobs/"
        searchable
        searchPlaceholder="Search by title, description, employer..."
        columns={[
          { key: "title", label: "Title", render: (row) => <strong>{String(row.title)}</strong> },
          { key: "employerName", label: "Employer", render: (row) => String(row.employerName) },
          { key: "employmentType", label: "Type", render: (row) => row.employmentType ? String(row.employmentType) : "—" },
          { key: "location", label: "Location", render: (row) => row.location ? String(row.location) : "—" },
          { key: "salaryRange", label: "Salary", render: (row) => row.salaryRange ? String(row.salaryRange) : "—" },
          { key: "createdAt", label: "Posted", render: (row) => String(row.createdAt) },
          { key: "matchScore", label: "Match", render: (row) => {
            const score = (row as JobRow).matchScore;
            return <MatchScoreBadge score={score ?? null} showBar={false} />;
          }, },
        ]}
      />
    </WorkspaceShell>
  );
}
