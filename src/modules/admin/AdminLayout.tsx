import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";
import { RoleLayoutShell } from "@/modules/workspace/RoleLayoutShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleCapability("admin", "admin.system");
  return (
    <WorkspaceOS session={session}>
      <RoleLayoutShell role={session.role} userName={session.name} userEmail={session.email}>
        {children}
      </RoleLayoutShell>
    </WorkspaceOS>
  );
}
