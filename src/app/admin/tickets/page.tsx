import { requireRoleCapability } from "@/modules/auth/session";
import { listTickets } from "./actions";
import { AdminTicketsTable } from "./admin-tickets-table";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listTickets({ limit: 100 });

  return <AdminTicketsTable session={session} tickets={result.tickets} />;
}
