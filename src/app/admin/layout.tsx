import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleCapability("admin", "admin.system");
  return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
}
