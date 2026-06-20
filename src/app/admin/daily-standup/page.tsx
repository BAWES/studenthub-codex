import { requireRoleCapability } from "@/modules/auth/session";
import { listDailyStandups } from "./actions";
import { AdminDailyStandupsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDailyStandupPage() {
<<<<<<< HEAD
  const session = await requireRoleCapability("admin", "app.access");
=======
  const session = await requireRoleCapability("admin", "admin.read");
>>>>>>> origin/develop
  const result = await listDailyStandups({ limit: 100 });

  return <AdminDailyStandupsTable session={session} answers={result.answers} />;
}
