import { requireRoleCapability } from "@/modules/auth/session";
import { listUniversities } from "@/modules/admin/university/actions";
import { AdminUniversityTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminUniversityPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const { records } = await listUniversities({ limit: 200 });

  return <AdminUniversityTable session={session} records={records} />;
}
