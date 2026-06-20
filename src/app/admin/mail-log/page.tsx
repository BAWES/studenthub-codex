import { requireRoleCapability } from "@/modules/auth/session";
import { listMailLogs } from "@/modules/mail-logs/actions";
import { AdminMailLogTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminMailLogPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listMailLogs({ limit: 50, page: 1 });

  return (
    <AdminMailLogTable session={session} initialRecords={result.records} />
  );
}
