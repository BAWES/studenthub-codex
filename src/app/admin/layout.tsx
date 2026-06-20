import { RoleWorkspaceLayout } from "@/modules/workspace/RoleWorkspaceLayout";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleWorkspaceLayout role="admin" capability="admin.system">{children}</RoleWorkspaceLayout>;
}
