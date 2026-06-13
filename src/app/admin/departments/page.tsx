import { requireRoleCapability } from "@/modules/auth/session";
import { listDepartments } from "./actions";
import { AdminDepartmentsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listDepartments({ limit: 100 });

  return (
    <AdminDepartmentsTable session={session} departments={result.items} />
  );
}