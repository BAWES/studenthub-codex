import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";
import { RoleLayoutShell } from "@/modules/workspace/RoleLayoutShell";

export const dynamic = "force-dynamic";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRoleCapability("company", "company.read.linked");
  return (
    <WorkspaceOS session={session}>
      <RoleLayoutShell
        role="company"
        userName={session.name}
        userEmail={session.email}
      >
        {children}
      </RoleLayoutShell>
    </WorkspaceOS>
  );
}
