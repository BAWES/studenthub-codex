import { requireRoleCapability } from "@/modules/auth/session";
import { listContracts } from "./actions";
import { AdminContractsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminContractsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listContracts({ limit: 100 });

  return <AdminContractsTable session={session} contracts={result.items} />;
}
