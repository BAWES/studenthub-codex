"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type BusinessDevelopmentRow = {
  id: string | number;
  companyName: string;
  companyEmail: string;
  contactName: string;
  contactPosition: string;
  phoneNumber: string;
  requestingFor: string;
  status: boolean | null;
  countryName: string;
  currencyCode: string;
  createdAt: string;
};

type Props = {
  session: SessionUser;
  rows: BusinessDevelopmentRow[];
  total: number;
};

export function CandidateBusinessDevelopmentTable({
  session,
  rows,
  total,
}: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Business Development"
      metrics={[
        { label: "Total Records", value: total, note: "all time" },
        {
          label: "Active",
          value: rows.filter((r) => r.status === true).length,
          note: "approved/active",
        },
      ]}
    >
      <DataTablePage
        title="Business Development"
        description="Track business development requests and company outreach."
        rows={rows}
        searchable
        searchPlaceholder="Search by company name, contact..."
        columns={[
          {
            key: "companyName",
            label: "Company",
            render: (row) => <strong>{String(row.companyName)}</strong>,
          },
          {
            key: "contactName",
            label: "Contact",
            render: (row) => String(row.contactName),
          },
          {
            key: "companyEmail",
            label: "Email",
            render: (row) => {
              const email = String(row.companyEmail);
              return email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-[var(--sh-coral)] hover:underline"
                >
                  {email}
                </a>
              ) : (
                <span className="text-[var(--muted)]">&mdash;</span>
              );
            },
          },
          {
            key: "requestingFor",
            label: "Requesting For",
            render: (row) => String(row.requestingFor) || <span className="text-[var(--muted)]">&mdash;</span>,
          },
          {
            key: "countryName",
            label: "Country",
            render: (row) => String(row.countryName) || <span className="text-[var(--muted)]">&mdash;</span>,
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <StatusBadge
                variant={row.status === true ? "success" : row.status === false ? "error" : "muted"}
                label={row.status === true ? "Active" : row.status === false ? "Inactive" : "Pending"}
                size="sm"
              />
            ),
          },
          {
            key: "createdAt",
            label: "Created",
            render: (row) => String(row.createdAt).slice(0, 10),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
