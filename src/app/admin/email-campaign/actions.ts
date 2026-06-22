export type EmailCampaignRow = {
  id: string;
  subject: string;
  message: string;
  progress: number;
  trigger_at: string | null;
  last_trigger_at: string | null;
  is_recurring: boolean;
  trigger_period: number | null;
  target: string;
  status: boolean;
  created_at: string | null;
  updated_at: string | null;
  filters: Array<{ id: string; param: string; value: string }>;
};

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function listEmailCampaigns() {
  await requireRoleCapability("admin", "admin.read");

  const campaigns = await prisma.email_campaign.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
    select: {
      campaign_uuid: true,
      subject: true,
      message: true,
      progress: true,
      trigger_date_time: true,
      last_trigger_date_time: true,
      is_recurring: true,
      trigger_period: true,
      target: true,
      status: true,
      created_at: true,
      updated_at: true,
      email_campaign_filter: {
        select: {
          cf_uuid: true,
          param: true,
          value: true,
        },
      },
    },
  });

  return campaigns.map((c) => ({
    id: c.campaign_uuid,
    subject: c.subject ?? "(no subject)",
    message: c.message ?? "",
    progress: c.progress ?? 0,
    trigger_at: c.trigger_date_time?.toISOString() ?? null,
    last_trigger_at: c.last_trigger_date_time?.toISOString() ?? null,
    is_recurring: c.is_recurring ?? false,
    trigger_period: c.trigger_period ?? null,
    target: c.target ?? "both",
    status: c.status ?? false,
    created_at: c.created_at?.toISOString() ?? null,
    updated_at: c.updated_at?.toISOString() ?? null,
    filters: c.email_campaign_filter.map((f) => ({
      id: f.cf_uuid,
      param: f.param ?? "",
      value: f.value ?? "",
    })),
  }));
}

export async function getEmailCampaignDetail(campaignUuid: string) {
  await requireRoleCapability("admin", "admin.read");

  const campaign = await prisma.email_campaign.findUnique({
    where: { campaign_uuid: campaignUuid },
    select: {
      campaign_uuid: true,
      subject: true,
      message: true,
      progress: true,
      trigger_date_time: true,
      last_trigger_date_time: true,
      is_recurring: true,
      trigger_period: true,
      target: true,
      status: true,
      created_at: true,
      updated_at: true,
      email_campaign_filter: {
        select: {
          cf_uuid: true,
          param: true,
          value: true,
        },
      },
    },
  });

  if (!campaign) return null;

  return {
    id: campaign.campaign_uuid,
    subject: campaign.subject ?? "",
    message: campaign.message ?? "",
    progress: campaign.progress ?? 0,
    trigger_at: campaign.trigger_date_time?.toISOString() ?? null,
    last_trigger_at: campaign.last_trigger_date_time?.toISOString() ?? null,
    is_recurring: campaign.is_recurring ?? false,
    trigger_period: campaign.trigger_period ?? null,
    target: campaign.target ?? "both",
    status: campaign.status ?? false,
    created_at: campaign.created_at?.toISOString() ?? null,
    updated_at: campaign.updated_at?.toISOString() ?? null,
    filters: campaign.email_campaign_filter.map((f) => ({
      id: f.cf_uuid,
      param: f.param ?? "",
      value: f.value ?? "",
    })),
  };
}

export async function updateEmailCampaign(
  campaignUuid: string,
  data: {
    subject?: string;
    message?: string;
    target?: string;
    is_recurring?: boolean;
    trigger_period?: number | null;
    trigger_date_time?: string | null;
    status?: boolean;
    progress?: number;
  }
) {
  await requireRoleCapability("admin", "admin.write");

  await prisma.email_campaign.update({
    where: { campaign_uuid: campaignUuid },
    data: {
      subject: data.subject,
      message: data.message,
      target: data.target,
      is_recurring: data.is_recurring,
      trigger_period: data.trigger_period ?? null,
      trigger_date_time: data.trigger_date_time ? new Date(data.trigger_date_time) : null,
      status: data.status,
      progress: data.progress,
      updated_at: new Date(),
    },
  });

  revalidatePath("/admin/email-campaign");
}

export async function deleteEmailCampaign(campaignUuid: string) {
  await requireRoleCapability("admin", "admin.write");

  await prisma.email_campaign.delete({
    where: { campaign_uuid: campaignUuid },
  });

  revalidatePath("/admin/email-campaign");
}

export async function createEmailCampaign(data: {
  subject: string;
  message?: string;
  target?: string;
  is_recurring?: boolean;
  trigger_period?: number | null;
  trigger_date_time?: string | null;
  status?: boolean;
}) {
  await requireRoleCapability("admin", "admin.write");

  const uuid = crypto.randomUUID();

  await prisma.email_campaign.create({
    data: {
      campaign_uuid: uuid,
      subject: data.subject,
      message: data.message ?? null,
      target: data.target ?? "both",
      is_recurring: data.is_recurring ?? false,
      trigger_period: data.trigger_period ?? null,
      trigger_date_time: data.trigger_date_time ? new Date(data.trigger_date_time) : null,
      status: data.status ?? false,
      progress: 0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/admin/email-campaign");
  return { uuid };
}
