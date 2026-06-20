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

  if (!campaignUuid) {
    notFound();
  }

  const campaign = await getEmailCampaign({ campaignUuid });

  if (!campaign) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Email campaigns"
        title={campaign.subject ?? "Email Campaign"}
        metrics={[
          {
            label: "Progress",
            value: campaign.progress != null ? `${campaign.progress}%` : "—",
            note: "Delivery progress",
          },
        ]}
      >
        <DetailSection
          title="Campaign Details"
          facts={[
            { label: "Subject", value: campaign.subject ?? "—" },
            { label: "Target", value: campaign.target ?? "—" },
            {
              label: "Status",
              value: campaign.status ? "Active" : "Inactive",
            },
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
