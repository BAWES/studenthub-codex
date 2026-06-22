import { requireRoleCapability } from "@/modules/auth/session";
import { listSalaries } from "./actions";
import { AdminSalariesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminSalaryPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const { records } = await listSalaries({ limit: 100 });

  return <AdminSalariesTable session={session} records={records} />;
}
