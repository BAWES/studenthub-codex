import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateIdRequest } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function getStatusLabel(status: string | null): string {
  if (!status) return "Unknown";
  return STATUS_LABELS[status] ?? `Unknown (${status})`;
}

export default async function AdminCandidateAccountRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const data = await getCandidateIdRequest(id);

  if (!data.request) {
    notFound();
  }

  const r = data.request;

  const facts = [
    { label: "CIR UUID", value: r.cir_uuid },
    { label: "Candidate IDs", value: r.candidate_ids ?? "—" },
    { label: "Status", value: getStatusLabel(r.status) },
    { label: "Rejection Reason", value: r.rejection_reason ?? "—" },
    { label: "Created By", value: r.created_by_name ?? "—" },
    { label: "Updated By", value: r.updated_by_name ?? "—" },
    { label: "Created", value: r.created_at ? formatDate(new Date(r.created_at)) : "—" },
    { label: "Updated", value: r.updated_at ? formatDate(new Date(r.updated_at)) : "—" },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Candidate Account Requests"
      title={`Request — ${r.cir_uuid.slice(0, 12)}…`}
      metrics={[]}
    >
      <DetailSection title="Request Details" facts={facts} />
    </WorkspaceShell>
  );
}
