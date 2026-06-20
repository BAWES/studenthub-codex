import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getMajor } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMajorDetailPage({
  params,
}: {
  params: Promise<{ majorId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { majorId } = await params;

  if (!majorId) {
    notFound();
  }

  const data = await getMajor(majorId);

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
        metrics={[
          {
            label: "Candidates",
            value: data.candidate_count,
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Major details"
          facts={[
            { label: "English name", value: major.major_name_en },
            { label: "Arabic name", value: major.major_name_ar },
            { label: "Data source", value: major.data_source?.toString() ?? "—" },
            {
              label: "Created",
              value: major.major_created_at
                ? new Date(major.major_created_at).toLocaleDateString()
                : "—",
            },
            {
              label: "Updated",
              value: major.major_updated_at
                ? new Date(major.major_updated_at).toLocaleDateString()
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
