import { requireRoleCapability } from "@/modules/auth/session";
import { getDashboardData } from "./actions";
import { AdminDashboardClient } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const dashboard = await getDashboardData();

  return <AdminDashboardClient session={session} dashboard={dashboard} />;
}
