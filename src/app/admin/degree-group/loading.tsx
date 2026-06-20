import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default async function AdminDegreeGroupLoading() {
  const session = await requireRoleCapability("admin", "admin.system");

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Degree Groups" metrics={[]}>
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    </WorkspaceShell>
  );
}
