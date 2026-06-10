import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getIdRequest } from "../actions";
import { formatDate } from "@/modules/workspace/format";
import { IdRequestActions } from "./IdRequestActions";

export const dynamic = "force-dynamic";

export default async function InspectorIdRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("inspector", "id_review.read");
  const { id } = await params;
  const data = await getIdRequest({ id });

  if (!data) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Inspector / ID Request"
      title={`ID request ${data.cir_uuid.slice(0, 18)}`}
      metrics={data.metrics}
      primary={{ title: "Candidates", rows: data.candidates }}
    >
      <DetailSection
        title="Batch"
        facts={[
          { label: "Status", value: data.status },
          { label: "Created By", value: data.created_by_name },
          { label: "Updated By", value: data.updated_by_name },
          { label: "Created", value: formatDate(data.created_at) },
          { label: "Updated", value: formatDate(data.updated_at) },
          { label: "Raw Candidate IDs", value: data.candidate_ids },
          ...(data.status === "rejected" && data.rejection_reason
            ? [{ label: "Rejection reason", value: data.rejection_reason }]
            : [])
        ]}
      />
      <IdRequestActions
        requestUuid={data.cir_uuid}
        currentStatus={data.status}
      />
    </WorkspaceShell>
  );
}
