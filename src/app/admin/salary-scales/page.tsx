import { requireRoleCapability } from "@/modules/auth/session";
import { listSalaryScales } from "@/modules/admin/salary-scales/actions";
import { AdminSalaryScalesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminSalaryScalesPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const { records } = await listSalaryScales({ limit: 200 });

  return <AdminSalaryScalesTable session={session} records={records} />;
}
