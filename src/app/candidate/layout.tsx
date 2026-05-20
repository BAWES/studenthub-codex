import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";

export const dynamic = "force-dynamic";

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
}
