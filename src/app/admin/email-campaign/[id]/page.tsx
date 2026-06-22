import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getEmailCampaignDetail } from "../actions";
import { EmailCampaignDetailForm } from "./EmailCampaignDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminEmailCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const campaign = await getEmailCampaignDetail(id);
  if (!campaign) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Email Campaign"
      title={campaign.subject || "(no subject)"}
      metrics={[
        { label: "Status", value: campaign.status ? "Active" : "Inactive", note: "Campaign state" },
        { label: "Progress", value: `${campaign.progress}%`, note: "Completion" },
        { label: "Target", value: campaign.target ?? "both", note: "Audience" },
        ...(campaign.created_at
          ? [{ label: "Created", value: formatDate(new Date(campaign.created_at)), note: "Record created" }]
          : []),
        ...(campaign.updated_at
          ? [{ label: "Updated", value: formatDate(new Date(campaign.updated_at)), note: "Last modified" }]
          : []),
      ]}
    >
      <EmailCampaignDetailForm campaign={campaign} />
    </WorkspaceShell>
  );
}
