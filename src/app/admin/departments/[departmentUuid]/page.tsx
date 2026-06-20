import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getDepartment } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentDetailPage({
  params,
}: {
  params: Promise<{ departmentUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { departmentUuid } = await params;

  const data = await getDepartment(departmentUuid);

  if (!data.department) {
    notFound();
  }

  const dept = data.department;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Departments"
        title={dept.department_name_en}
        metrics={[
          {
            label: "Employees",
            value: data.employee_count,
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Department Details"
          facts={[
            { label: "Name (EN)", value: dept.department_name_en },
            { label: "Name (AR)", value: dept.department_name_ar ?? "—" },
            {
              label: "Employees",
              value: String(data.employee_count),
            },
            {
              label: "Created",
              value: dept.department_created_at
                ? formatDate(new Date(dept.department_created_at))
                : "—",
            },
            {
              label: "Updated",
              value: dept.department_updated_at
                ? formatDate(new Date(dept.department_updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
