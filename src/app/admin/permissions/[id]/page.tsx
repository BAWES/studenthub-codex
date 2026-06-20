import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getPermissionSection } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminPermissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const section = await getPermissionSection({ permissionUuid: id });

  if (!section) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Permissions"
        title={`Permission Section — ${section.section_name ?? "Unnamed Section"}`}
        metrics={[
          {
            label: "Section Name",
            value: section.section_name ?? "—",
            note: "",
          },
          {
            label: "UUID",
            value: section.permission_uuid,
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Section Details"
          facts={[
            { label: "Permission UUID", value: section.permission_uuid },
            { label: "Section Name", value: section.section_name ?? "—" },
            {
              label: "Created",
              value: formatDate(new Date(section.created_at)),
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/permissions" as Route}>
            <Button variant="outline">Back to Permissions</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
