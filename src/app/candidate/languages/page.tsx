import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateLanguages } from "./actions";

export const dynamic = "force-dynamic";

export default async function CandidateLanguagesPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const languages = await listCandidateLanguages({});

  const rows = languages.map((l) => ({
    id: l.candidate_language_id,
    language: l.language,
    proficiency: l.proficiency,
    created_at: l.candidate_language_created_at
      ? formatDate(l.candidate_language_created_at)
      : "N/A",
  }));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate"
      title="Languages"
      metrics={[
        { label: "Total", value: languages.length, note: "Languages on your profile" },
      ]}
    >
      <DataTable
        title="Languages"
        description="Languages and proficiency levels associated with your candidate profile."
        rows={rows}
        rowHref="/candidate/languages/"
        columns={[
          { key: "language", label: "Language", render: (row) => <strong>{row.language}</strong> },
          { key: "proficiency", label: "Proficiency", render: (row) => row.proficiency },
          { key: "created_at", label: "Added", render: (row) => row.created_at },
        ]}
      />
    </WorkspaceShell>
  );
}
