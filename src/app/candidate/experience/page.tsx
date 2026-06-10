import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateExperience } from "./actions";

export const dynamic = "force-dynamic";

export default async function CandidateExperiencePage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const items = await listCandidateExperience({});

  const rows = items.map((e) => ({
    id: e.candidate_experience_id,
    experience: e.experience,
    employer: e.employer ?? "—",
    period:
      e.start_year && e.end_year
        ? `${e.start_year} – ${e.end_year}`
        : e.start_year
          ? `From ${e.start_year}`
          : e.end_year
            ? `Until ${e.end_year}`
            : "—",
    created_at: e.created_at ? formatDate(e.created_at) : "N/A",
  }));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Experience"
      metrics={[
        { label: "Total", value: items.length, note: "Experience entries on your profile" },
      ]}
    >
      <DataTable
        title="Work Experience"
        description="Your work history and professional experience."
        rows={rows}
        rowHref={(row) => `/candidate/experience/${row.id}` as Route}
        columns={[
          { key: "experience", label: "Position", render: (row) => <strong>{row.experience}</strong> },
          { key: "employer", label: "Employer", render: (row) => row.employer },
          { key: "period", label: "Period", render: (row) => row.period },
          { key: "created_at", label: "Added", render: (row) => row.created_at },
        ]}
      />
    </WorkspaceShell>
  );
}
