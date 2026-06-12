import { requireRoleCapability } from "@/modules/auth/session";
import { listAwsConfigs } from "./actions";
import { AdminAwsTable } from "./admin-aws-table";

export const dynamic = "force-dynamic";

export default async function AdminAwsPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const configs = await listAwsConfigs();

  return <AdminAwsTable session={session} configs={configs} />;
}
