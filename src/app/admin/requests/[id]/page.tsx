import { notFound } from "next/navigation";
import { requireRole } from "@/modules/auth/session";
import { CompactList, FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getRequestDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("admin");
  const { id } = await params;
  const data = await getRequestDetail(id);

  if (!data.request) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Request"
      title={data.request.request_position_title ?? "Untitled request"}
      metrics={data.metrics}
      primary={{ title: "Applications", rows: data.applications }}
      secondary={{ title: "Invitations", rows: data.invitations }}
    >
      <FactPanel
        title="Request Brief"
        facts={[
          { label: "Company", value: data.request.company?.company_name },
          { label: "Contact", value: data.request.contact?.contact_name },
          { label: "Owner", value: data.request.staff?.staff_name },
          { label: "Compensation", value: data.request.request_compensation },
          { label: "Location", value: data.request.request_location },
          { label: "Created", value: formatDate(data.request.request_created_datetime) },
          { label: "Updated", value: formatDate(data.request.request_updated_datetime) }
        ]}
      />
      <section className="detailGrid">
        <CompactList title="Interviews" rows={data.interviews} />
        <CompactList title="Activity" rows={data.activities} />
        <CompactList title="Stories" rows={data.stories} />
        <CompactList title="Notes" rows={data.notes} />
      </section>
    </WorkspaceShell>
  );
}
