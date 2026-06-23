import { requireRoleCapability } from "@/modules/auth/session";
import { listUniversity } from "./actions";
import { AdminUniversityTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminUniversityPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const result = await listUniversity({ limit: 100 });

  return (
    <AdminUniversityTable session={session} universities={result.records} />
  );
}
