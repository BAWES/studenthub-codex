import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStaffLeave } from "@/modules/staff-leaves/actions";

export const dynamic = "force-dynamic";

function statusVariant(status: number | null) {
  if (status === 1) return "success" as const;
  if (status === 2 || status === 3) return "warning" as const;
  return "default" as const;
}

const STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Cancelled",
};

function getStatusLabel(status: number | null): string {
  if (status === null) return "Unknown";
  return STATUS_LABELS[status] ?? `Unknown (${status})`;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function StaffLeaveDetailPage({
  params,
}: {
  params: Promise<{ leaveUuid: string }>;
}) {
  const session = await requireRoleCapability("staff", "staff_leave.read");
  const { leaveUuid } = await params;
  const leave = await getStaffLeave(leaveUuid);

  if (!leave) {
    notFound();
  }

  const facts: any[] = [
    { label: "Staff", value: leave.staff_name ?? "—" },
    { label: "Category", value: leave.category ? leave.category.charAt(0).toUpperCase() + leave.category.slice(1) : "—" },
    { label: "From", value: formatDate(leave.from_date) },
    { label: "To", value: formatDate(leave.to_date) },
    {
      label: "Status",
      value: <Badge variant={statusVariant(leave.status)}>{getStatusLabel(leave.status)}</Badge>
    },
    { label: "Note", value: leave.note ?? "—" },
    { label: "Created", value: formatDate(leave.created_at) },
    { label: "Updated", value: formatDate(leave.updated_at) },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Leaves"
      title={leave.staff_name ?? "Leave Detail"}
      metrics={[]}
    >
      <DetailSection title="Leave Details" facts={facts} />

      <section className="detailPanel">
        <h3 className="text-base font-semibold border-l-2 border-[#eb6651] pl-3 mb-4">Navigation</h3>
        <div className="flex flex-wrap gap-2">
          <Link href={"/staff/leaves" as Route}>
            <Button variant="ghost">Back to Leaves</Button>
          </Link>
        </div>
      </section>
    </WorkspaceShell>
  );
}
