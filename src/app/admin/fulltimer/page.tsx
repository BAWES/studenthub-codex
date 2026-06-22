import { requireRoleCapability } from "@/modules/auth/session";
import { listFulltimers } from "./actions";
import { AdminFulltimersTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminFulltimerPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const { records } = await listFulltimers({ limit: 100 });

  return <AdminFulltimersTable session={session} records={records} />;
}
