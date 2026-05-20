import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";

export const dynamic = "force-dynamic";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleCapability("company", "company.read.linked");
  return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
}
