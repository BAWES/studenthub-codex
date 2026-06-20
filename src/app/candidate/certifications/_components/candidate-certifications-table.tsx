"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: number;
  certification_name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidateCertificationsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Certifications"
      metrics={[
        { label: "Total", value: rows.length, note: "Certifications on your profile" },
      ]}
    >
      <DataTable
        title="Certifications"
        description="Professional certifications and credentials associated with your profile."
        rows={rows}
        rowHref="/candidate/certifications/"
        columns={[
          { key: "certification_name", label: "Certification", render: (row) => <strong>{row.certification_name}</strong> },
          { key: "issuing_organization", label: "Issuer", render: (row) => row.issuing_organization },
          { key: "issue_date", label: "Issue Date", render: (row) => row.issue_date },
          { key: "expiry_date", label: "Expiry Date", render: (row) => row.expiry_date },
          { key: "credential_id", label: "Credential ID", render: (row) => row.credential_id },
        ]}
      />
    </WorkspaceShell>
  );
}
