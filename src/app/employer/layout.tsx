import { RoleWorkspaceLayout } from "@/modules/workspace/RoleWorkspaceLayout";

export const dynamic = "force-dynamic";

/**
 * Employer layout — company role users access employer-specific features.
 * Reuses the company RoleWorkspaceLayout since employers are company users.
 */
export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <RoleWorkspaceLayout role="company" capability="company.read.linked">{children}</RoleWorkspaceLayout>;
}
