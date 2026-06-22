"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string;
  title: string;
  issuer: string;
  period: string;
  createdAt: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateCertificatesTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Certificates"
      metrics={[
        { label: "Total", value: rows.length, note: "Certificates on your profile" },
      ]}
    >
      <DataTable
        title="Certificates & Credentials"
        description="Academic certificates, professional credentials, and awarded certifications."
        rows={rows}
        rowHref="/candidate/certificates/"
        columns={[
          { key: "title", label: "Title", render: (row) => <strong>{row.title}</strong> },
          { key: "issuer", label: "Issuer", render: (row) => row.issuer },
          { key: "period", label: "Period", render: (row) => row.period },
          { key: "createdAt", label: "Added", render: (row) => row.createdAt },
        ]}
      />
    </WorkspaceShell>
  );
}
