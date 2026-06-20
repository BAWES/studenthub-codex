import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getAdminAttendance } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<number, string> = {
  0: "Absent",
  5: "Half Day",
  10: "Present",
  20: "Late",
  30: "Overtime",
};

function getStatusLabel(status: number): string {
  return STATUS_LABELS[status] ?? `Unknown (${status})`;
}

export default async function AdminAttendanceDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { uuid } = await params;

  const data = await getAdminAttendance(uuid);

  if (!data.attendance) {
    notFound();
  }

  const a = data.attendance;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Attendance"
        title={`Attendance — ${a.date}`}
        metrics={[
          {
            label: "Employee",
            value: data.employee_name ?? "—",
            note: "",
          },
          {
            label: "Status",
            value: getStatusLabel(a.status),
            note: "",
          },
          {
            label: "Total Hours",
            value: a.total_hours != null ? `${Number(a.total_hours).toFixed(2)}h` : "—",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Attendance Details"
          facts={[
            { label: "UUID", value: a.attendance_uuid },
            { label: "Employee UUID", value: a.employee_uuid ?? "—" },
            { label: "Date", value: a.date },
            {
              label: "Clock In",
              value: a.clock_in ? formatDate(new Date(a.clock_in)) : "—",
            },
            {
              label: "Clock Out",
              value: a.clock_out ? formatDate(new Date(a.clock_out)) : "—",
            },
            {
              label: "Total Hours",
              value: a.total_hours != null ? `${Number(a.total_hours).toFixed(2)}` : "—",
            },
            {
              label: "Status",
              value: getStatusLabel(a.status),
            },
            {
              label: "Note",
              value: a.note ?? "—",
            },
            {
              label: "Created",
              value: a.created_at ? formatDate(new Date(a.created_at)) : "—",
            },
            {
              label: "Updated",
              value: a.updated_at ? formatDate(new Date(a.updated_at)) : "—",
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/attendance" as Route}>
            <Button variant="outline">Back to Attendance</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
