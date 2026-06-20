import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleCapability("staff", "request.read.assigned");
  return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
}
