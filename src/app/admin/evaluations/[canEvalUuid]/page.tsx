import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getEvaluation } from "@/modules/admin/evaluations/actions";
import Link from "next/link";

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

        <div className="mt-6 flex gap-4">
          <Link
            href={`/api/evaluations/${evalRecord.can_eval_uuid}/pdf?format=pdf`}
            download
            data-testid="download-pdf"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF Report
          </Link>
        </div>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
