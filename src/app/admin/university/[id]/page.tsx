import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getUniversity } from "@/modules/admin/university/actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminUniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const universityId = Number(id);

  if (Number.isNaN(universityId)) {
    notFound();
  }

  const university = await getUniversity(universityId);

  if (!university) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Universities"
        title={university.university_name_en ?? university.university_name_ar ?? "Unnamed"}
        metrics={[]}
      >
        <DetailSection
          title="University Details"
          facts={[
            { label: "ID", value: String(university.university_id) },
            { label: "Name (English)", value: university.university_name_en ?? "—" },
            { label: "Name (Arabic)", value: university.university_name_ar ?? "—" },
            { label: "Data Source", value: university.university_data_source?.toString() ?? "—" },
            {
              label: "Created",
              value: university.university_created_at
                ? formatDate(new Date(university.university_created_at))
                : "—",
            },
            {
              label: "Updated",
              value: university.university_updated_at
                ? formatDate(new Date(university.university_updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
