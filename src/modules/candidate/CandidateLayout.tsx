import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";
import { RoleLayoutShell } from "@/modules/workspace/RoleLayoutShell";

export const dynamic = "force-dynamic";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  return (
    <WorkspaceOS session={session}>
      <RoleLayoutShell
        role="candidate"
        userName={session.name}
        userEmail={session.email}
      >
        {children}
      </RoleLayoutShell>
    </WorkspaceOS>
  );
}
