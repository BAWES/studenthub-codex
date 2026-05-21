import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyRequestRows } from "@/modules/workspace/data";
export const dynamic = "force-dynamic";
const statusBadgeVariant: Record<string, "default" | "success" | "warning" | "secondary" | "outline"> = { pending: "warning", started: "default", delivered: "success", cancelled: "outline", finished_by_recruitment: "success", re_work: "secondary" };
function statusVariant(status: string) { return statusBadgeVariant[status] ?? "outline"; }
export default async function CompanyRequestsPage() {
  const session = await requireRoleCapability("company", "request.read.linked");
  const rows = await getCompanyRequestRows(session.id);
  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Requests" metrics={[]}>
      <div style={{ marginBottom: 16 }}><Link href="/company/requests/create" className="primaryButton">New Request</Link></div>
      <DataTable title="Hiring Requests" description="Requests across the company accounts linked to this contact." rows={rows} rowHref={function(row) { return ("/company/requests/" + row.id) as Route }} columns={[
        { key: "title", label: "Request", render: function(row) { return <strong>{row.title}</strong> } },
        { key: "company", label: "Company", render: function(row) { return row.company } },
        { key: "owner", label: "Owner", render: function(row) { return row.owner } },
        { key: "seats", label: "Seats", render: function(row) { return row.seats } },
        { key: "status", label: "Status", render: function(row) { return <Badge variant={statusVariant(row.status)}>{row.status}</Badge> } },
        { key: "updated", label: "Updated", render: function(row) { return row.updated } }
      ]} />
    </WorkspaceShell>
  );
}
