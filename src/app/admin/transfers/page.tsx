import { requireRoleCapability } from "@/modules/auth/session";
import { getAdminTransferRows } from "@/modules/workspace/data";
import { AdminTransfersTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminTransfersPage() {
  const session = await requireRoleCapability("admin", "finance.read");
  const rows = await getAdminTransferRows();
  const latest = rows[0];

  return <AdminTransfersTable session={session} rows={rows} latest={latest} />;
}
