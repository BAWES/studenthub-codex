import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getEvaluation } from "@/modules/admin/evaluations/actions";

export const dynamic = "force-dynamic";

export default async function AdminEvaluationDetailPage({
  params,
}: {
  params: Promise<{ canEvalUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { canEvalUuid } = await params;

  if (!canEvalUuid) {
    notFound();
  }

  const data = await getEvaluation({ canEvalUuid });

  if (!data.evaluation) {
    notFound();
  }

  const evalRecord = data.evaluation;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Evaluations"
        title={`Evaluation — ${evalRecord.candidate_name ?? "Unknown Candidate"}`}
        metrics={[
          {
            label: "Candidate ID",
            value: String(evalRecord.candidate_id ?? "—"),
            note: "",
          },
          {
            label: "Staff Evaluator",
            value: evalRecord.staff_name ?? "—",
            note: "",
          },
        ]}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <DetailSection
              title="Evaluation Details"
              facts={[
                { label: "UUID", value: evalRecord.can_eval_uuid ?? "—" },
                { label: "Candidate", value: evalRecord.candidate_name ?? "—" },
                { label: "Candidate ID", value: String(evalRecord.candidate_id ?? "—") },
                { label: "Department ID", value: String(evalRecord.dept_id ?? "—") },
                { label: "Staff Evaluator", value: evalRecord.staff_name ?? "—" },
                { label: "Staff ID", value: String(evalRecord.staff_id ?? "—") },
                {
                  label: "Start Date",
                  value: evalRecord.start_date
                    ? new Date(evalRecord.start_date).toLocaleDateString()
                    : "—",
                },
                {
                  label: "End Date",
                  value: evalRecord.end_date
                    ? new Date(evalRecord.end_date).toLocaleDateString()
                    : "—",
                },
                {
                  label: "Created",
                  value: evalRecord.created_at
                    ? new Date(evalRecord.created_at).toLocaleDateString()
                    : "—",
                },
                {
                  label: "Updated",
                  value: evalRecord.updated_at
                    ? new Date(evalRecord.updated_at).toLocaleDateString()
                    : "—",
                },
              ]}
            />
          </div>
          <div className="shrink-0 pt-6">
            <a
              href={`/api/evaluations/${canEvalUuid}/pdf?format=pdf`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              download
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </a>
          </div>
        </div>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
