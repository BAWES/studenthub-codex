import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";

export const dynamic = "force-dynamic";

export default async function InspectorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleCapability("inspector", "id_review.read");
  return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
}
