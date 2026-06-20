import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCompanyRequests } from "./actions";
import { AdminCompanyRequestsTable } from "./_components";

export const dynamic = "force-dynamic";

/** Map Boolean (TinyInt) status value to label string. */
function intToStatusLabel(value: number | null): string {
  if (value === 1) return "approved";
  return "pending";
}

const ADMIN_CR_LIMIT = 60;

export default async function AdminCompanyRequestsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listCompanyRequests({ limit: ADMIN_CR_LIMIT });

  const rows = result.items.map((r) => ({
    id: r.company_request_uuid,
    company_name: r.company_name ?? "—",
    contact_name: r.contact_name ?? "—",
    currency_code: r.currency_code ?? "—",
    status: intToStatusLabel(r.status),
    updated: r.updated_at ? formatDate(new Date(r.updated_at)) : "—",
  }));

  return <AdminCompanyRequestsTable session={session} rows={rows} />;
}
