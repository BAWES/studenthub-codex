import { requireRoleCapability } from "@/modules/auth/session";
import { listInvoices } from "./actions";
import { AdminInvoicesPage } from "./_components";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const session = await requireRoleCapability("admin", "finance.read");
  const result = await listInvoices({ limit: 20 });

  return (
    <AdminInvoicesPage
      session={session}
      initialRows={result.items}
      initialTotal={result.total}
    />
  );
}
