<<<<<<< HEAD
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getDegree } from "./actions";
import { formatDate } from "@/modules/workspace/format";
=======
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getDegreeDetail, getDegreeGroupOptions } from "../actions";
import { DegreeDetailForm } from "./DegreeDetailForm";
>>>>>>> origin/main

export const dynamic = "force-dynamic";

export default async function AdminDegreeDetailPage({
<<<<<<< HEAD
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
=======
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const degree = await getDegreeDetail(id);
  if (!degree) {
    notFound();
  }

  const groups = await getDegreeGroupOptions();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Degree"
      title={degree.degree_name_en}
      metrics={[
        { label: "Created", value: formatDate(degree.degree_created_at), note: "Record created" },
        { label: "Updated", value: formatDate(degree.degree_updated_at), note: "Last modified" }
      ]}
    >
      <DegreeDetailForm degree={degree} groups={groups} />
    </WorkspaceShell>
>>>>>>> origin/main
  );
}
