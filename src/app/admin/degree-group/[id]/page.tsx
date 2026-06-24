import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getDegreeGroup } from "../actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminDegreeGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const data = await getDegreeGroup({ degree_group_uuid: id });

  if (!data.degree_group) {
    notFound();
  }

  const dg = data.degree_group;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Degree Groups"
        title={dg.degree_group_name_en}
        metrics={[]}
      >
        <DetailSection
          title="Degree Group Details"
          facts={[
            { label: "UUID", value: dg.degree_group_uuid },
            { label: "English Name", value: dg.degree_group_name_en },
            { label: "Arabic Name", value: dg.degree_group_name_ar || "—" },
            { label: "Sort Order", value: dg.degree_group_sort_order?.toString() || "—" },
            { label: "Skip Major", value: dg.skip_major ? "Yes" : "No" },
            {
              label: "Created",
              value: dg.degree_group_created_at
                ? formatDate(new Date(dg.degree_group_created_at))
                : "—",
            },
            {
              label: "Updated",
              value: dg.degree_group_updated_at
                ? formatDate(new Date(dg.degree_group_updated_at))
                : "—",
            },
          ]}
        />
        <section className="flex gap-2 p-4">
          <Link href={"/admin/degree-group" as Route}>
            <Button variant="outline">Back to Degree Groups</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
