import { requireRoleCapability } from "@/modules/auth/session";
import { listDegree } from "./actions";
import { AdminDegreeTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDegreePage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const result = await listDegree({ limit: 100 });

  return (
    <AdminDegreeTable session={session} degrees={result.records} />
  );
}
