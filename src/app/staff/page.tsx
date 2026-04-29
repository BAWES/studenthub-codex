import { requireRole } from "@/modules/auth/session";
import { getStaffWorkspace } from "@/modules/workspace/data";
import { FeatureGrid } from "@/modules/workspace/FeatureGrid";
import { navForRole } from "@/modules/workspace/navigation";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const session = await requireRole("staff");
  const data = await getStaffWorkspace(Number(session.id));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff Workspace"
      title={`Welcome back, ${data.staff?.staff_name ?? session.name}.`}
      metrics={data.metrics}
      primary={{ title: "Assigned Requests", rows: data.requests }}
      secondary={{ title: "Stories", rows: data.stories }}
    >
      <FeatureGrid items={navForRole("staff").filter((item) => item.href !== "/staff")} />
    </WorkspaceShell>
  );
}
