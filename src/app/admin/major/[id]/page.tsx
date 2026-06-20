import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getMajor } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminMajorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  // ID is a string (major_uuid), no Number conversion needed
  if (!id) {
    notFound();
  }

  const data = await getMajor({ majorUuid: id });

  if (!data.major) {
    notFound();
  }

  const major = data.major;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Majors"
        title={major.major_name_en}
        metrics={[]}
      >
        <DetailSection
          title="Major Details"
          facts={[
            { label: "English Name", value: major.major_name_en },
            { label: "Arabic Name", value: major.major_name_ar },
            {
              label: "Data source",
              value: major.data_source != null ? String(major.data_source) : "—",
            },
            {
              label: "Created",
              value: major.major_created_at
                ? formatDate(new Date(major.major_created_at))
                : "—",
            },
            {
              label: "Updated",
              value: major.major_updated_at
                ? formatDate(new Date(major.major_updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
