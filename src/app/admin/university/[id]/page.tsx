import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getUniversity } from "./actions";

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

  const data = await getUniversity(universityId);

  if (!data.university) {
    notFound();
  }

  const university = data.university;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Universities"
        title={university.university_name_en || "University"}
        metrics={[]}
      >
        <DetailSection
          title="University Details"
          facts={[
            { label: "English name", value: university.university_name_en || "—" },
            { label: "Arabic name", value: university.university_name_ar || "—" },
            { label: "Data source", value: university.university_data_source != null ? String(university.university_data_source) : "—" },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
