import { requireRoleCapability } from "@/modules/auth/session";
import { listMajors } from "./actions";
import { AdminMajorsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminMajorPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listMajors({ limit: 100 });

  return <AdminMajorsTable session={session} majors={result.majors} />;
}
