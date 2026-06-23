import { requireRoleCapability } from "@/modules/auth/session";
import { listSalaries } from "@/modules/admin/salary/actions";
import { AdminSalaryTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminSalaryPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listSalaries({ limit: 100 });

  return <AdminSalaryTable session={session} salaries={result.salaries} />;
}
