import { requireRoleCapability } from "@/modules/auth/session";
import { listInvoices } from "./actions";
import { AdminInvoicesTable } from "./admin-invoices-table";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listInvoices({ limit: 100 });

  return <AdminInvoicesTable session={session} invoices={result.items} />;
}
