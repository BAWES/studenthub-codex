import { requireRoleCapability } from "@/modules/auth/session";
import { listAdminAttendance, getEmployeeOptions } from "./actions";
import { AdminAttendanceTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const [result, employees] = await Promise.all([
    listAdminAttendance({ limit: 100 }),
    getEmployeeOptions(),
  ]);

  return (
    <AdminAttendanceTable
      session={session}
      attendance={result.items}
      employees={employees}
    />
  );
}
