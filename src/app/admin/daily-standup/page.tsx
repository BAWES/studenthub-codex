import { requireRoleCapability } from "@/modules/auth/session";
import { listDailyStandups } from "./actions";
import { AdminDailyStandupsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDailyStandupPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const result = await listDailyStandups({ limit: 100 });

  return <AdminDailyStandupsTable session={session} answers={result.answers} />;
}
