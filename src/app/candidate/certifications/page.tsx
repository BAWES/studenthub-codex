import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateCertifications } from "./actions";

export const dynamic = "force-dynamic";

export default async function CandidateCertificationsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const certifications = await listCandidateCertifications({});

  const rows = certifications.map((c) => ({
    id: c.certification_id,
    certification_name: c.certification_name,
    issuing_organization: c.issuing_organization,
    issue_date: c.issue_date ? formatDate(c.issue_date) : "N/A",
    expiry_date: c.expiry_date ? formatDate(c.expiry_date) : "N/A",
    credential_id: c.credential_id ?? "—",
  }));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Certifications"
      metrics={[
        { label: "Total", value: certifications.length, note: "Certifications on your profile" },
      ]}
    >
      <DataTable
        title="Certifications"
        description="Professional certifications and credentials associated with your profile."
        rows={rows}
        rowHref={(row) => `/candidate/certifications/${row.id}` as Route}
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
