import { requireRoleCapability } from "@/modules/auth/session";
import { listStoresTypesense } from "@/modules/admin/stores/search-typesense";
import { AdminStoresTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listStoresTypesense({ limit: 100 });

  return <AdminStoresTable session={session} stores={result.items} />;
}
