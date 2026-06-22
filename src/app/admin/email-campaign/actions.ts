"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getEmailCampaignDetail(campaignUuid: string) {
  await requireRoleCapability("admin", "admin.system");

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
        select: { cf_uuid: true, param: true, value: true }
      }
    }
  });

  return campaign;
}

export async function updateEmailCampaign(
  campaignUuid: string,
  data: {
    subject: string;
    message?: string;
    progress?: number;
    trigger_date_time?: Date | null;
    is_recurring?: boolean;
    trigger_period?: number | null;
    target?: string;
    status?: boolean;
  }
) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.email_campaign.update({
    where: { campaign_uuid: campaignUuid },
    data: {
      subject: data.subject,
      message: data.message ?? null,
      progress: data.progress ?? 0,
      trigger_date_time: data.trigger_date_time ?? null,
      is_recurring: data.is_recurring ?? false,
      trigger_period: data.trigger_period ?? null,
      target: data.target ?? "both",
      status: data.status ?? false,
      updated_at: new Date()
    }
  });

  revalidatePath("/admin/email-campaign");
}

export async function createEmailCampaign(data: {
  subject: string;
  message?: string;
  trigger_date_time?: Date | null;
  target?: string;
}) {
  await requireRoleCapability("admin", "admin.system");

  const uuid = crypto.randomUUID();

  await prisma.email_campaign.create({
    data: {
      campaign_uuid: uuid,
      subject: data.subject,
      message: data.message ?? null,
      trigger_date_time: data.trigger_date_time ?? null,
      target: data.target ?? "both",
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  revalidatePath("/admin/email-campaign");
  return { uuid };
}

export async function deleteEmailCampaign(campaignUuid: string) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.email_campaign.delete({
    where: { campaign_uuid: campaignUuid }
  });

  revalidatePath("/admin/email-campaign");
}
