import { requireRoleCapability } from "@/modules/auth/session";
import { listUniversities } from "./actions";
import { AdminUniversitiesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminUniversityPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listUniversities({ limit: 100 });

  return <AdminUniversitiesTable session={session} universities={result.items} />;
}
