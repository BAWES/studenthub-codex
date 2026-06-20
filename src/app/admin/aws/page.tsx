import { requireRoleCapability } from "@/modules/auth/session";
import { listAwsConfigs, getAwsConfig } from "./actions";
import { AdminAwsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminAwsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const [entries, awsResult] = await Promise.all([
    listAwsConfigs(),
    getAwsConfig(),
  ]);

  return (
    <AdminAwsTable session={session} entries={entries} awsResult={awsResult} />
  );
}