import { RoleWorkspaceLayout } from "@/modules/workspace/RoleWorkspaceLayout";

export const dynamic = "force-dynamic";

export default async function InspectorLayout({ children }: { children: React.ReactNode }) {
  return <RoleWorkspaceLayout role="inspector" capability="id_review.read">{children}</RoleWorkspaceLayout>;
}
