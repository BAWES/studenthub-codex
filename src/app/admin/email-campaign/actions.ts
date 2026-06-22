"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function getEmailCampaignDetail(id: string) {
  await requireRoleCapability("admin", "admin.system");
  return prisma.email_campaign.findUnique({
    where: { campaign_uuid: id },
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
    }
  });
}

export async function updateEmailCampaign(
  id: string,
  data: {
    subject?: string;
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
    where: { campaign_uuid: id },
    data: {
      ...data,
      updated_at: new Date(),
    }
  });
  revalidatePath("/admin/email-campaign");
}

export async function deleteEmailCampaign(id: string) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.email_campaign.delete({
    where: { campaign_uuid: id }
  });
  revalidatePath("/admin/email-campaign");
}
