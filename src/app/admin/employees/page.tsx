import { requireRoleCapability } from "@/modules/auth/session";
import { listAdminEmployees, getDepartments, getDesignations } from "./actions";
import { AdminEmployeesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const [{ employees }, departments, designations] = await Promise.all([
    listAdminEmployees({ limit: 100 }),
    getDepartments(),
    getDesignations(),
  ]);

  return (
    <AdminEmployeesTable
      session={session}
      employees={employees}
      departments={departments}
      designations={designations}
    />
  );
}
