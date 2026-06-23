import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEmployeeById, updateEmployeeRole } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<number, string> = {
  0: "Inactive",
  10: "Active",
  20: "Suspended",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  staff: "Staff",
};

function getStatusLabel(status: number): string {
  return STATUS_LABELS[status] ?? `Unknown (${status})`;
}

function roleBadge(role: string | null): React.ReactNode {
  if (role === "admin") return <Badge className="bg-blue-600">Admin</Badge>;
  if (role === "staff") return <Badge variant="secondary">Staff</Badge>;
  return <Badge variant="outline">—</Badge>;
}

function oppositeRole(current: string | null): "admin" | "staff" {
  if (current === "admin") return "staff";
  return "admin";
}

export default async function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const employee = await getEmployeeById({ uuid: id });

  if (!employee) {
    notFound();
  }

  const canWrite = session.capabilities?.includes("admin.write") ?? false;
  const newRole = oppositeRole(employee.employee_role);

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Employees"
        title={employee.employee_name}
        metrics={[
          {
            label: "Status",
            value: getStatusLabel(employee.employee_status),
            note: "",
          },
          {
            label: "Role",
            value: ROLE_LABELS[employee.employee_role ?? ""] ?? "—",
            note: "",
          },
          {
            label: "Designation",
            value: employee.designation_name_en ?? "—",
            note: "",
          },
          {
            label: "Department",
            value: employee.department_name_en ?? "—",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Employee Details"
          facts={[
            { label: "UUID", value: employee.employee_uuid },
            { label: "Name", value: employee.employee_name },
            { label: "Email", value: employee.employee_email },
            { label: "Phone", value: employee.employee_phone ?? "—" },
            {
              label: "Salary",
              value:
                employee.employee_salary != null
                  ? `${Number(employee.employee_salary).toFixed(3)} KWD`
                  : "—",
            },
            {
              label: "Status",
              value: getStatusLabel(employee.employee_status),
            },
            {
              label: "Role",
              value: employee.employee_role ?? "—",
            },
            {
              label: "Designation",
              value: employee.designation_name_en ?? "—",
            },
            {
              label: "Department",
              value: employee.department_name_en ?? "—",
            },
            {
              label: "Created",
              value: formatDate(new Date(employee.employee_created_at)),
            },
            {
              label: "Updated",
              value: formatDate(new Date(employee.employee_updated_at)),
            },
          ]}
        />

        {canWrite ? (
          <section className="flex gap-2 p-4">
            <form
              action={async () => {
                "use server";
                await updateEmployeeRole({ uuid: id, role: newRole });
              }}
            >
              <Button type="submit" variant="outline">
                {employee.employee_role === "admin"
                  ? "Demote to Staff"
                  : "Promote to Admin"}
              </Button>
            </form>
            <Link href={"/admin/employees" as Route}>
              <Button variant="outline">Back to Employees</Button>
            </Link>
          </section>
        ) : (
          <section className="flex gap-2 p-4">
            <Link href={"/admin/employees" as Route}>
              <Button variant="outline">Back to Employees</Button>
            </Link>
          </section>
        )}
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
