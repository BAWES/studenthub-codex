import { requireRoleCapability } from "@/modules/auth/session";
import { getDashboardData } from "./actions";
import { AdminDashboardContent } from "./admin-dashboard-content";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const data = await getDashboardData();

  return <AdminDashboardContent session={session} data={data} />;
}
