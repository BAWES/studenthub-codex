"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import type { JobApplicationRow } from "./schemas";

type Props = {
  applications: JobApplicationRow[];
  total: number;
  jobTitle: string;
};

export function EmployerApplicationsTable({ applications, total, jobTitle }: Props) {
  const rows = applications.map((a) => ({
    ...a,
    id: `app-${a.applicationId}`,
    createdAtStr: a.createdAt.toISOString().slice(0, 10),
  }));

  return (
    <DataTablePage
      title={`Applications for ${jobTitle}`}
      description={`${total} applicant${total === 1 ? "" : "s"} found`}
      rows={rows}
      searchable
      searchPlaceholder="Search by candidate name..."
      columns={[
        { key: "candidateName", label: "Candidate", render: (row) => String(row.candidateName ?? "—") },
        { key: "createdAtStr", label: "Applied", render: (row) => String(row.createdAtStr) },
        { key: "status", label: "Status", render: (row) => (
          <StatusBadge variant={genericStatusVariant(String(row.status))} label={String(row.status)} size="sm" />
        )},
      ]}
    />
  );
}
