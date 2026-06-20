import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getDegree } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminDegreeDetailPage({
  params,
}: {
  params: Promise<{ degreeUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { degreeUuid } = await params;

  if (!degreeUuid) {
    notFound();
  }

  const data = await getDegree(degreeUuid);

  if (!data.degree) {
    notFound();
  }

  const degree = data.degree;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Degrees"
        title={degree.degree_name_en}
        metrics={[]}
      >
        <DetailSection
          title="Degree Details"
          facts={[
            { label: "Name (EN)", value: degree.degree_name_en },
            { label: "Name (AR)", value: degree.degree_name_ar ?? "—" },
            { label: "Sort Order", value: String(degree.degree_sort_order ?? "—") },
            {
              label: "Created",
              value: degree.degree_created_at
                ? formatDate(new Date(degree.degree_created_at))
                : "—",
            },
            {
              label: "Updated",
              value: degree.degree_updated_at
                ? formatDate(new Date(degree.degree_updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
