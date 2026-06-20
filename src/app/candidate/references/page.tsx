import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateReferences } from "./actions";

export const dynamic = "force-dynamic";

export default async function CandidateReferencesPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const references = await listCandidateReferences({});

  const rows = references.map((r) => ({
    id: r.reference_uuid,
    name: r.name,
    company: r.company ?? "—",
    position: r.position ?? "—",
    created_at: r.created_at ? formatDate(r.created_at) : "N/A",
  }));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="References"
      metrics={[
        { label: "Total", value: references.length, note: "References on your profile" },
        { label: "With Email", value: references.filter((r) => r.email).length, note: "Contactable" },
      ]}
    >
      <DataTable
        title="References"
        description="Professional references associated with your candidate profile."
        rows={rows}
        rowHref={(row) => `/candidate/references/${row.id}` as Route}
        columns={[
          { key: "name", label: "Name", render: (row) => <strong>{row.name}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "position", label: "Position", render: (row) => row.position },
          { key: "created_at", label: "Added", render: (row) => row.created_at },
        ]}
      />
    </WorkspaceShell>
  );
}
