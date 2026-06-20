import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getUniversity } from "./actions";
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

  const uni = await getUniversity(universityId);

  if (!uni) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Universities"
        title={`University — ${uni.university_name_en ?? uni.university_name_ar ?? "Unnamed"}`}
        metrics={[
          {
            label: "Name (English)",
            value: uni.university_name_en ?? "—",
            note: "English name",
          },
          {
            label: "Name (Arabic)",
            value: uni.university_name_ar ?? "—",
            note: "Arabic name",
          },
        ]}
      >
        <DetailSection
          title="University Details"
          facts={[
            { label: "ID", value: String(uni.university_id) },
            { label: "Name (English)", value: uni.university_name_en ?? "—" },
            { label: "Name (Arabic)", value: uni.university_name_ar ?? "—" },
            {
              label: "Data Source",
              value: uni.university_data_source != null ? String(uni.university_data_source) : "—",
            },
            {
              label: "Created",
              value: uni.university_created_at ? formatDate(new Date(uni.university_created_at)) : "—",
            },
            {
              label: "Updated",
              value: uni.university_updated_at ? formatDate(new Date(uni.university_updated_at)) : "—",
            },
          ]}
        />

        <section style={{ display: "flex", gap: "0.5rem", padding: "1rem" }}>
          <Link href={"/admin/university" as Route}>
            <Button variant="outline">Back to Universities</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
