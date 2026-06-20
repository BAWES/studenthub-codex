import { requireRoleCapability } from "@/modules/auth/session";
import { listSalaries, listStaff } from "./actions";
import { AdminSalaryTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminSalaryPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const [result, staff] = await Promise.all([
    listSalaries({ limit: 100 }),
    listStaff(),
  ]);

  return (
    <AdminSalaryTable
      session={session}
      salaries={result.salaries}
      total={result.total}
      staff={staff}
    />
  );
}
