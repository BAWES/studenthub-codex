import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getEmailCampaign } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminEmailCampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { campaignUuid } = await params;

  if (!campaignUuid) notFound();

  const campaign = await getEmailCampaign({ campaignUuid });

  if (!campaign) {
    notFound();
  }

  const statusLabel = (status: boolean | null) => {
    if (status === null) return "—";
    return status ? "Active" : "Inactive";
  };

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Email Campaigns"
        title={campaign.subject ?? "Untitled Campaign"}
        metrics={[
          {
            label: "Status",
            value: statusLabel(campaign.status),
            note: "Current campaign status",
          },
          {
            label: "Progress",
            value: campaign.progress != null ? `${campaign.progress}%` : "—",
            note: "Completion percentage",
          },
          {
            label: "Target",
            value: campaign.target ?? "—",
            note: "Audience segment",
          },
        ]}
      >
        <DetailSection
          title="Campaign Details"
          facts={[
            { label: "Campaign UUID", value: campaign.campaign_uuid },
            { label: "Subject", value: campaign.subject ?? "—" },
            { label: "Message", value: campaign.message ?? "—" },
            { label: "Target", value: campaign.target ?? "—" },
            { label: "Progress", value: campaign.progress != null ? `${campaign.progress}%` : "—" },
            { label: "Status", value: statusLabel(campaign.status) },
            {
              label: "Created",
              value: campaign.created_at
                ? formatDate(new Date(campaign.created_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
