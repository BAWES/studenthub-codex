import { requireRoleCapability } from "@/modules/auth/session";
import { listCompanyNotes } from "./actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { CompanyNotesList } from "./_components";

export const dynamic = "force-dynamic";

export default async function CompanyNotesPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const result = await listCompanyNotes({ limit: 50 });

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Company Notes"
        title="Manage internal notes linked to your company accounts."
        metrics={[
          { label: "Total notes", value: result.total, note: "Across all companies" },
        ]}
      >
        <div className="space-y-6 mt-6">
          <CompanyNotesList
            notes={result.notes}
            total={result.total}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
