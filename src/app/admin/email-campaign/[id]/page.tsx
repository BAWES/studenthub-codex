import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getEmailCampaignDetail } from "../actions";
import { EmailCampaignDetailForm } from "./EmailCampaignDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminEmailCampaignDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const campaign = await getEmailCampaignDetail(id);
  if (!campaign) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Email Campaigns"
      title={campaign.subject ?? "(no subject)"}
      metrics={[
        {
          label: "Status",
          value: campaign.status ? "Active" : "Inactive",
          note: campaign.is_recurring ? "Recurring" : "One-time"
        },
        { label: "Progress", value: String(campaign.progress ?? 0) + "%", note: "Delivery progress" },
        {
          label: "Created",
          value: campaign.created_at ? formatDate(campaign.created_at) : "-",
          note: "Record created"
        },
        {
          label: "Updated",
          value: campaign.updated_at ? formatDate(campaign.updated_at) : "-",
          note: "Last modified"
        }
      ]}
    >
      <EmailCampaignDetailForm campaign={campaign} />
    </WorkspaceShell>
  );
}
