import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getDesignation } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminDesignationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const data = await getDesignation({ designationUuid: id });

  if (!data.designation) {
    notFound();
  }

  const desig = data.designation;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Designations"
        title={desig.designation_name_en}
        metrics={[]}
      >
        <DetailSection
          title="Designation Details"
          facts={[
            { label: "Name (EN)", value: desig.designation_name_en },
            { label: "Name (AR)", value: desig.designation_name_ar ?? "—" },
            {
              label: "Created",
              value: desig.designation_created_at
                ? formatDate(new Date(desig.designation_created_at))
                : "—",
            },
            {
              label: "Updated",
              value: desig.designation_updated_at
                ? formatDate(new Date(desig.designation_updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
