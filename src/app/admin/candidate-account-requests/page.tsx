import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateIdRequests } from "./actions";
import { AdminCandidateAccountRequestsTable } from "./_components";

export const dynamic = "force-dynamic";

const ADMIN_CIR_LIMIT = 60;

export default async function AdminCandidateAccountRequestsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listCandidateIdRequests({ limit: ADMIN_CIR_LIMIT });

  const rows = result.items.map((r) => ({
    id: r.cir_uuid,
    candidate_ids: r.candidate_ids ?? "—",
    status: r.status ?? "—",
    rejection_reason: r.rejection_reason ?? "",
    created_by_name: r.created_by_name ?? "—",
    updated: r.updated_at ? formatDate(new Date(r.updated_at)) : "—",
  }));

  return <AdminCandidateAccountRequestsTable session={session} rows={rows} />;
}