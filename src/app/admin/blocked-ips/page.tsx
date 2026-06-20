import { requireRoleCapability } from "@/modules/auth/session";
import { listBlockedIps } from "./actions";
import { AdminBlockedIpsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminBlockedIpsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const { records } = await listBlockedIps({ limit: 100 });

  return <AdminBlockedIpsTable session={session} records={records} />;
}
