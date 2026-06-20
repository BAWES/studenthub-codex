import { requireRoleCapability } from "@/modules/auth/session";
import { listDegrees } from "./actions";
import { AdminDegreesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDegreesPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listDegrees({ limit: 100 });

  return <AdminDegreesTable session={session} degrees={result.degrees} />;
}
