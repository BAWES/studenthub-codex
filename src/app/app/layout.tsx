import { requireSession } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
}
