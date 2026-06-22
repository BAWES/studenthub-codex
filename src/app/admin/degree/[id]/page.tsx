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
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const data = await getDegree({ degreeUuid: id });

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
        metrics={[
          {
            label: "Sort order",
            value:
              degree.degree_sort_order != null
                ? String(degree.degree_sort_order)
                : "—",
            note: "Display ordering",
          },
          {
            label: "Name (Arabic)",
            value: degree.degree_name_ar ?? "—",
            note: "Arabic translation",
          },
        ]}
      >
        <DetailSection
          title="Degree Details"
          facts={[
            { label: "Degree UUID", value: degree.degree_uuid },
            { label: "Name (English)", value: degree.degree_name_en },
            {
              label: "Name (Arabic)",
              value: degree.degree_name_ar ?? "—",
            },
            {
              label: "Degree Group UUID",
              value: degree.degree_group_uuid ?? "—",
            },
            {
              label: "Sort order",
              value:
                degree.degree_sort_order != null
                  ? String(degree.degree_sort_order)
                  : "—",
            },
            {
              label: "Created",
              value: degree.degree_created_at
                ? formatDate(new Date(degree.degree_created_at))
                : "—",
            },
            {
              label: "Last updated",
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
