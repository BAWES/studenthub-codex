import { requireRoleCapability } from "@/modules/auth/session";
import { listCurrencies } from "./actions";
import { AdminCurrencyTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminCurrencyPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const { currencies, total } = await listCurrencies({ limit: 100 });

  return <AdminCurrencyTable session={session} records={currencies} total={total} />;
}
