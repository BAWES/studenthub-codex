import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getSalary } from "./actions";
import { SalaryDetailView } from "./SalaryDetailView";

export const dynamic = "force-dynamic";

export default async function AdminSalaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const record = await getSalary(id);

  if (!record) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Salary"
      title={record.staff_name ? `Salary: ${record.staff_name}` : "Salary details"}
      metrics={[
        { label: "Amount", value: record.salary != null ? `${record.salary_currency ?? "KWD"} ${record.salary}` : "—", note: "Salary amount" },
        { label: "Date", value: record.salary_date ? new Date(record.salary_date).toLocaleDateString() : "—", note: "Salary date" },
      ]}
    >
      <SalaryDetailView record={record} />
    </WorkspaceShell>
  );
}
