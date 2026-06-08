import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceOS } from "@/modules/workspace/WorkspaceOS";
import type { Role, Capability } from "@/modules/auth/types";

export function createRoleLayout(role: Role, capability: Capability) {
  return async function RoleLayout({ children }: { children: React.ReactNode }) {
    const session = await requireRoleCapability(role, capability);
    return <WorkspaceOS session={session}>{children}</WorkspaceOS>;
  };
}
