import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getSalaryScale } from "@/app/admin/salary-scales/actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminSalaryScaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const salaryScaleId = parseInt(id, 10);

  if (isNaN(salaryScaleId)) {
    notFound();
  }

  const record = await getSalaryScale(salaryScaleId);

  if (!record) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Salary scales"
        title={record.salary_scale_name_en}
        metrics={[
          {
            label: "Sort order",
            value: record.salary_scale_id,
            note: "Salary scale ID",
          },
          {
            label: "Candidates",
            value: record.candidate_count != null ? String(record.candidate_count) : "—",
            note: "Candidates on this scale",
          },
        ]}
      >
        <DetailSection
          title="Salary Scale Details"
          facts={[
            { label: "ID", value: String(record.salary_scale_id) },
            { label: "Name (English)", value: record.salary_scale_name_en },
            {
              label: "Name (Arabic)",
              value: record.salary_scale_name_ar ?? "—",
            },
            {
              label: "Min amount",
              value:
                record.salary_scale_min_amount != null
                  ? String(record.salary_scale_min_amount)
                  : "—",
            },
            {
              label: "Max amount",
              value:
                record.salary_scale_max_amount != null
                  ? String(record.salary_scale_max_amount)
                  : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
