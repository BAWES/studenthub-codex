import Link from "next/link";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getUniversity } from "@/modules/admin/university/actions";
import { formatDate } from "@/modules/workspace/format";
import { prisma } from "@/lib/prisma";
import { UniversityDetailForm } from "./UniversityDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminUniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const universityId = Number(id);

  if (Number.isNaN(universityId) || universityId < 1) {
    notFound();
  }

  const university = await getUniversity(universityId);

  if (!university) {
    notFound();
  }

  const displayName = university.university_name_en ?? university.university_name_ar ?? "Unnamed";

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Universities"
        title={`University — ${displayName}`}
        metrics={[
          { label: "Name (English)", value: university.university_name_en ?? "—", note: "" },
          { label: "Name (Arabic)", value: university.university_name_ar ?? "—", note: "" },
        ]}
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
              value: (university as any).university_created_at
                ? formatDate(new Date((university as any).university_created_at))
                : "—",
            },
            {
              label: "Updated",
              value: (university as any).university_updated_at
                ? formatDate(new Date((university as any).university_updated_at))
                : "—",
            },
          ]}
        />
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/university">Back to Universities</Link>
          </Button>
        </div>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
