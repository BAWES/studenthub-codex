import { requireRoleCapability } from "@/modules/auth/session";
import { listEvents } from "@/modules/admin/event/actions";
import { AdminEventTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminEventPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const result = await listEvents({ limit: 100 });

  return <AdminEventTable session={session} events={result.events} />;
}
