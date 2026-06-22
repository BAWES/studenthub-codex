"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import type { webhook_method } from "@prisma/client";

export async function getWebhookDetail(webhookId: number) {
  await requireRoleCapability("admin", "admin.system");

  const webhook = await prisma.webhook.findUnique({
    where: { webhook_id: webhookId },
    select: {
      webhook_id: true,
      event: true,
      endpoint: true,
      method: true,
      created_by: true,
      updated_by: true,
      created_at: true,
      updated_at: true,
    }
  });

  return webhook;
}

export async function updateWebhook(
  webhookId: number,
  data: {
    event: string;
    endpoint: string;
    method?: webhook_method;
  }
) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.webhook.update({
    where: { webhook_id: webhookId },
    data: {
      event: data.event,
      endpoint: data.endpoint,
      method: data.method,
      updated_at: new Date()
    }
  });

  revalidatePath("/admin/webhook");
}

export async function createWebhook(data: {
  event: string;
  endpoint: string;
  method?: webhook_method;
}) {
  await requireRoleCapability("admin", "admin.system");

  const webhook = await prisma.webhook.create({
    data: {
      event: data.event,
      endpoint: data.endpoint,
      method: data.method ?? "POST",
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  revalidatePath("/admin/webhook");
  return { id: webhook.webhook_id };
}

export async function deleteWebhook(webhookId: number) {
  await requireRoleCapability("admin", "admin.system");

  await prisma.webhook.delete({
    where: { webhook_id: webhookId }
  });

  revalidatePath("/admin/webhook");
}
