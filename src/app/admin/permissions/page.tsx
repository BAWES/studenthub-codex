import { requireRoleCapability } from "@/modules/auth/session";
import { listPermissionSections } from "./actions";
import { AdminPermissionsTable } from "./admin-permissions-table";

export const dynamic = "force-dynamic";

export default async function AdminPermissionsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const sections = await listPermissionSections();

  return <AdminPermissionsTable session={session} sections={sections} />;
}
