import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listRequests } from "./actions";
import { AdminRequestsTable } from "./admin-requests-table";

export const dynamic = "force-dynamic";

const ADMIN_REQUEST_LIMIT = 60;

export default async function AdminRequestsPage() {
  const session = await requireRoleCapability("admin", "request.read.any");
  const result = await listRequests({ limit: ADMIN_REQUEST_LIMIT });

  const rows = result.items.map((r) => ({
    id: r.request_uuid,
    title: r.title,
    company: r.company_name ?? "No company",
    owner: r.staff_name ?? "Unassigned",
    seats: r.no_of_employees ?? 0,
    status: r.status,
    updated: r.updated_at ? formatDate(new Date(r.updated_at)) : "—",
  }));

  return <AdminRequestsTable session={session} rows={rows} />;
}
