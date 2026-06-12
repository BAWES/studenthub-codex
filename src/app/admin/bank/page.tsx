import { requireRoleCapability } from "@/modules/auth/session";
import { listBanks } from "./actions";
import { AdminBankTable } from "./admin-bank-table";

export const dynamic = "force-dynamic";

export default async function AdminBankPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listBanks({ limit: 100 });

  return <AdminBankTable session={session} banks={result.items} />;
}
