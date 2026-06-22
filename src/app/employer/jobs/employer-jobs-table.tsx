"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type JobRow = Record<string, unknown> & {
  id: string | number;
  title: string;
  employmentType?: string;
  location?: string;
  salaryRange?: string;
  status: string | null;
  createdAt: string;
};

type Props = {
  session: SessionUser;
  rows: JobRow[];
  total: number;
};

export function EmployerJobsTable({ session, rows, total }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer"
      title="Job Postings"
      metrics={[
        { label: "Total Jobs", value: total, note: "all postings" },
        { label: "Active", value: rows.filter((r) => r.status === "active").length, note: "currently visible" },
        { label: "Drafts", value: rows.filter((r) => r.status === "draft").length, note: "not published" },
      ]}
    >
      <DataTablePage
        title="Job Postings"
        description="Manage your company's job listings for student recruitment."
        rows={rows}
        rowHref="/employer/jobs/"
        searchable
        searchPlaceholder="Search by title, description..."
        actions={
          <Button asChild>
            <Link
              href="/employer/jobs/new"
              className="inline-flex items-center gap-2"
            >
              + New Job Posting
            </Link>
          </Button>
        }
        columns={[
          { key: "title", label: "Title", render: (row) => <strong>{String(row.title)}</strong> },
          { key: "employmentType", label: "Type", render: (row) => row.employmentType ? String(row.employmentType) : "—" },
          { key: "location", label: "Location", render: (row) => row.location ? String(row.location) : "—" },
          { key: "salaryRange", label: "Salary", render: (row) => row.salaryRange ? String(row.salaryRange) : "—" },
          { key: "status", label: "Status", render: (row) => (
            <StatusBadge variant={genericStatusVariant(String(row.status ?? "unknown"))} label={String(row.status ?? "unknown")} size="sm" />
          )},
          { key: "createdAt", label: "Posted", render: (row) => String(row.createdAt) },
        ]}
      />
    </WorkspaceShell>
  );
}
