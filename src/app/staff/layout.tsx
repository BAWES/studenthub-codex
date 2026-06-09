import { RoleWorkspaceLayout } from "@/modules/workspace/RoleWorkspaceLayout";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  return <RoleWorkspaceLayout role="staff" capability="request.read.assigned">{children}</RoleWorkspaceLayout>;
}
