import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listStoreAssignmentRequests } from "./actions";
import { AdminUserRequestsTable } from "./_components";

export const dynamic = "force-dynamic";

/** Map TinyInt status value to label string. */
function intToStatusLabel(value: number | null): string {
  if (value === 1) return "approved";
  return "pending";
}

const ADMIN_SAR_LIMIT = 60;

export default async function AdminUserRequestsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listStoreAssignmentRequests({ limit: ADMIN_SAR_LIMIT });

  const rows = result.items.map((r) => ({
    id: r.sar_uuid,
    candidate_name: r.candidate_name ?? "—",
    store_name: r.store_name ?? "—",
    currency_code: r.currency_code ?? "—",
    status: intToStatusLabel(r.status),
    updated: r.updated_at ? formatDate(new Date(r.updated_at)) : "—",
  }));

  return <AdminUserRequestsTable session={session} rows={rows} />;
}
