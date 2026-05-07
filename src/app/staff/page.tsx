import { requireRoleCapability } from "@/modules/auth/session";
import { StaffHome } from "@/modules/staff/StaffHome";
import { getStaffWorkspace } from "@/modules/workspace/data";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const session = await requireRoleCapability("staff", "request.read.assigned");
  const data = await getStaffWorkspace(Number(session.id));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff Workspace"
      title={`Welcome back, ${data.staff?.staff_name ?? session.name}.`}
      metrics={data.metrics}
    >
      <StaffHome data={data} />
    </WorkspaceShell>
  );
}
