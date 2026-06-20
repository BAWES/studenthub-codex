import { requireRoleCapability } from "@/modules/auth/session";
import { listSalaries } from "./actions";
import { AdminSalaryTable } from "./_components/admin-salary-table";

export const dynamic = "force-dynamic";

export default async function AdminSalaryListPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const { salaries, total } = await listSalaries();

  return (
    <AdminSalaryTable session={session} salaries={salaries} total={total} />
  );
}
