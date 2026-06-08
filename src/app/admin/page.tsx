import { Dashboard } from "@/modules/dashboard/Dashboard";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireRoleCapability("admin", "admin.system");

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin Workspace"
      title="Command center for the whole operation."
      metrics={[]}
    >
      <Dashboard />
    </WorkspaceShell>
  );
}
