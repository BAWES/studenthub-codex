"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type AgencyRow = {
  id: string | number;
  companyName: string;
  companyEmail: string;
  companyWebsite: string;
  commercialLicence: string;
  totalCandidates: number;
  activeRequests: number;
  createdAt: string;
};

type Props = {
  session: SessionUser;
  rows: AgencyRow[];
  total: number;
};

export function CandidateAgenciesTable({ session, rows, total }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Agencies"
      metrics={[
        { label: "Total Agencies", value: total, note: "all time" },
        {
          label: "With Active Requests",
          value: rows.filter((r) => r.activeRequests > 0).length,
          note: "currently hiring",
        },
      ]}
    >
      <DataTablePage
        title="Agencies"
        description="Browse and manage agencies (companies) you have worked with or are interested in."
        rows={rows}
        searchable
        searchPlaceholder="Search by agency name..."
        columns={[
          {
            key: "companyName",
            label: "Agency Name",
            render: (row) => <strong>{String(row.companyName)}</strong>,
          },
          {
            key: "companyEmail",
            label: "Email",
            render: (row) => {
              const email = String(row.companyEmail);
              return email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-coral hover:underline"
                >
                  {email}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              );
            },
          },
          {
            key: "totalCandidates",
            label: "Candidates",
            render: (row) => String(row.totalCandidates),
          },
          {
            key: "activeRequests",
            label: "Active Requests",
            render: (row) => String(row.activeRequests),
          },
          {
            key: "createdAt",
            label: "Created",
            render: (row) => String(row.createdAt),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
