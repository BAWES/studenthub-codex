import { requireRoleCapability } from "@/modules/auth/session";
import { listEvents } from "./actions";
import { AdminEventsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listEvents({ limit: 100 });

  return (
    <AdminEventsTable session={session} events={result.events} />
  );
}
