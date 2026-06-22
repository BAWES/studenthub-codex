import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";
import type { Role, Capability } from "@/modules/auth/types";

/**
 * Shared layout for role-scoped workspace routes.
 *
 * Each role route layout (admin, staff, candidate, company, inspector) delegates
 * to this component, eliminating 5 nearly-identical copies of the same pattern.
 *
 * @param role - The role name (e.g. "admin", "staff").
 * @param capability - The capability string for the role check (e.g. "admin.system").
 * @param children - Page content.
 */
export async function RoleWorkspaceLayout({
  role,
  capability,
  children,
}: {
  role: Role;
  capability: Capability;
  children: React.ReactNode;
}) {
  const session = await requireRoleCapability(role, capability);
  return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
}
