import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { CompactList, FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getInspectorIdRequestDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function InspectorIdRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("inspector", "id_review.read");
  const { id } = await params;
  const data = await getInspectorIdRequestDetail(id);

  if (!data.request) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Inspector / ID Request"
      title={`ID request ${data.request.cir_uuid.slice(0, 18)}`}
      metrics={data.metrics}
      primary={{ title: "Candidates", rows: data.candidates }}
    >
      <FactPanel
        title="Batch"
        facts={[
          { label: "Status", value: data.request.status },
          { label: "Created By", value: data.request.staff_candidate_id_request_created_byTostaff?.staff_name },
          { label: "Updated By", value: data.request.staff_candidate_id_request_updated_byTostaff?.staff_name },
          { label: "Created", value: formatDate(data.request.created_at) },
          { label: "Updated", value: formatDate(data.request.updated_at) },
          { label: "Raw Candidate IDs", value: data.request.candidate_ids }
        ]}
      />
    </WorkspaceShell>
  );
}
