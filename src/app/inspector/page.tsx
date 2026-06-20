import { requireRoleCapability } from "@/modules/auth/session";
import { getInspectorWorkspace } from "./actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";

export const dynamic = "force-dynamic";

export default async function InspectorPage() {
  const session = await requireRoleCapability("inspector", "id_review.read");
  const data = await getInspectorWorkspace(session.id);

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Inspector Workspace"
        title={`Verification queue for ${data.inspector?.inspector_name ?? session.name}.`}
        metrics={data.metrics}
        primary={{ title: "Recent ID Requests", rows: data.requests }}
      />
    </ErrorBoundary>
  );
}
