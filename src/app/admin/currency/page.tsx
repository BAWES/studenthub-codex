import { requireRoleCapability } from "@/modules/auth/session";
import { listCurrencies } from "./actions";
import { AdminCurrenciesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminCurrenciesPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listCurrencies({ limit: 100 });

  return (
    <AdminCurrenciesTable session={session} currencies={result.currencies} />
  );
}
