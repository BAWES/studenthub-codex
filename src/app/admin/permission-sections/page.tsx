import { requireRoleCapability } from "@/modules/auth/session";
import { listPermissionSections } from "./actions";
import { AdminPermissionSectionsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminPermissionSectionsPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const result = await listPermissionSections();

  const sections = Array.isArray(result) ? result : [];

  return <AdminPermissionSectionsTable session={session} sections={sections} />;
}
