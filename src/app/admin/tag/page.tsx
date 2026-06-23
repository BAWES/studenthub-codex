import { requireRoleCapability } from "@/modules/auth/session";
import { listTags } from "@/modules/admin/tag/actions";
import { AdminTagTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminTagPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const { records } = await listTags({ limit: 200 });

  return <AdminTagTable session={session} records={records} />;
}
