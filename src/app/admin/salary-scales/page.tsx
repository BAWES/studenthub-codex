import { requireRoleCapability } from "@/modules/auth/session";
import { listSalaryScales } from "./actions";
import { AdminSalaryScalesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminSalaryScalesPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listSalaryScales({ limit: 100 });

  return (
    <AdminSalaryScalesTable session={session} items={result.items} />
  );
}
