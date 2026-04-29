import { requireRole } from "@/modules/auth/session";
import { getInspectorWorkspace } from "@/modules/workspace/data";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function InspectorPage() {
  const session = await requireRole("inspector");
  const data = await getInspectorWorkspace(session.id);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Inspector Workspace"
      title={`Verification queue for ${data.inspector?.inspector_name ?? session.name}.`}
      metrics={data.metrics}
      primary={{ title: "Recent ID Requests", rows: data.requests }}
    />
  );
}
