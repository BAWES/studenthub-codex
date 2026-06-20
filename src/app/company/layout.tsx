import { RoleWorkspaceLayout } from "@/modules/workspace/RoleWorkspaceLayout";

export const dynamic = "force-dynamic";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <RoleWorkspaceLayout role="company" capability="company.read.linked">{children}</RoleWorkspaceLayout>;
}
