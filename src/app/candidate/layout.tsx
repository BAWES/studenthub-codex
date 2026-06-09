import { RoleWorkspaceLayout } from "@/modules/workspace/RoleWorkspaceLayout";

export const dynamic = "force-dynamic";

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <RoleWorkspaceLayout role="candidate" capability="candidate.read.own">{children}</RoleWorkspaceLayout>;
}
