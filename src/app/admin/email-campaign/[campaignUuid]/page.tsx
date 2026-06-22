import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/modules/workspace/format";
import { getEmailCampaignDetail } from "../actions";
import { EmailCampaignDetailForm } from "./EmailCampaignDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminEmailCampaignDetailPage({ params }: { params: Promise<{ campaignUuid: string }> }) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { campaignUuid } = await params;

  const campaign = await getEmailCampaignDetail(campaignUuid);
  if (!campaign) notFound();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Email Campaigns"
      title={campaign.subject ?? "Email Campaign"}
      metrics={[
        { label: "Progress", value: `${campaign.progress ?? 0}%`, note: "Campaign progress" },
        { label: "Recurring", value: campaign.is_recurring ? "Yes" : "No", note: "Recurring campaign" },
        { label: "Created", value: formatDate(campaign.created_at), note: "Record created" }
      ]}
    >
      <EmailCampaignDetailForm campaign={campaign} />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/email-campaign" as Route}>
          <Button variant="outline">Back to Email Campaigns</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
