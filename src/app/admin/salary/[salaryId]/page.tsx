import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getSalary } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSalaryDetailPage({
  params,
}: {
  params: Promise<{ salaryId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { salaryId } = await params;

  if (!salaryId) {
    notFound();
  }

  const data = await getSalary(salaryId);

  if (!data.salary) {
    notFound();
  }

  const salary = data.salary;
  const staffName = data.staff_name ?? `Staff #${salary.staff_id}`;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Salary"
        title={`${staffName} — ${salary.salary ? Number(salary.salary).toLocaleString() : "—"} ${salary.salary_currency ?? "KWD"}`}
        metrics={[
          {
            label: "Salary amount",
            value: salary.salary ? `${Number(salary.salary).toLocaleString()} ${salary.salary_currency ?? "KWD"}` : "—",
            note: "",
          },
        ]}
      >
        <FactPanel
          title="Salary details"
          facts={[
            { label: "Staff name", value: staffName },
            { label: "Amount", value: salary.salary ? `${Number(salary.salary).toLocaleString()}` : "—" },
            { label: "Currency", value: salary.salary_currency ?? "KWD" },
            {
              label: "Date",
              value: salary.salary_date
                ? new Date(salary.salary_date).toLocaleDateString()
                : "—",
            },
            { label: "Comment", value: salary.comment ?? "—" },
            {
              label: "Created",
              value: salary.created_at
                ? new Date(salary.created_at).toLocaleDateString()
                : "—",
            },
            {
              label: "Updated",
              value: salary.updated_at
                ? new Date(salary.updated_at).toLocaleDateString()
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
