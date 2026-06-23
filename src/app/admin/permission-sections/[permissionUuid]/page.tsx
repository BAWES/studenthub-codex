import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getPermissionSection } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminPermissionSectionDetailPage({
  params,
}: {
  params: Promise<{ permissionUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { permissionUuid } = await params;

  const result = await getPermissionSection(permissionUuid);

  // Handle error responses (ActionError)
  if ("error" in result) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Permission Sections"
        title={result.sectionName ?? `Section #${result.permissionUuid.slice(0, 8)}`}
        metrics={[
          {
            label: "Permission UUID",
            value: result.permissionUuid,
            note: "Permission section identifier",
          },
        ]}
      >
        <DetailSection
          title="Section Details"
          facts={[
            { label: "Section Name", value: result.sectionName ?? "—" },
            {
              label: "Created",
              value: result.createdAt ? formatDate(new Date(result.createdAt)) : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
