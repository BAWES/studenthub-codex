import { requireRoleCapability } from "@/modules/auth/session";
import { listUniversities } from "./actions";
import { AdminUniversityTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminUniversityPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const { records } = await listUniversities({ limit: 100 });

  return <AdminUniversityTable session={session} records={records} />;
}
