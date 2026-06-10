import { requireRoleCapability } from "@/modules/auth/session";
import { getStaffWorkspace } from "./actions";
import { getPipelineData, getPipelineMetrics } from "@/modules/staff/pipeline";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { PipelineClientWrapper } from "@/modules/staff/pipeline/PipelineClientWrapper";
import { updatePipelineStageAction } from "@/modules/staff/pipeline/actions";
import type { PipelineStage } from "@/modules/staff/pipeline";

export const dynamic = "force-dynamic";

async function updateAction(invitationUuid: string, stage: PipelineStage) {
  "use server";
  return updatePipelineStageAction({ invitationUuid, stage });
}

export default async function StaffPage() {
  const session = await requireRoleCapability("staff", "request.read.assigned");
  const staffId = Number(session.id);

  const [data, pipelineItems] = await Promise.all([
    getStaffWorkspace(staffId),
    getPipelineData(staffId),
  ]);

  const metrics = await getPipelineMetrics(pipelineItems);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff Workspace"
      title={`Welcome back, ${data.staff?.staff_name ?? session.name}.`}
      metrics={data.metrics}
    >
      <PipelineClientWrapper
        initialItems={pipelineItems}
        metrics={metrics}
        updateAction={updateAction}
      />
    </WorkspaceShell>
  );
}
