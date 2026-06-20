import { Dashboard } from "@/modules/dashboard/Dashboard";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { FeatureGrid } from "@/modules/workspace/FeatureGrid";
import { navForRole } from "@/modules/workspace/navigation";

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
      <FeatureGrid items={navForRole("admin").filter((item) => item.href !== "/admin")} />
      <Dashboard />
    </WorkspaceShell>
  );
}
