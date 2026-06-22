"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export type WebhookMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function getWebhookDetail(id: number) {
  await requireRoleCapability("admin", "admin.system");
  return prisma.webhook.findUnique({
    where: { webhook_id: id },
    select: {
      webhook_id: true,
      event: true,
      endpoint: true,
      method: true,
      created_by: true,
      created_at: true,
      updated_at: true,
    }
  });
}

export async function updateWebhook(
  id: number,
  data: {
    event: string;
    endpoint: string;
    method?: WebhookMethod | null;
  }
) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.webhook.update({
    where: { webhook_id: id },
    data: {
      event: data.event,
      endpoint: data.endpoint,
      method: data.method ?? null,
      updated_at: new Date(),
    }
  });
  revalidatePath("/admin/webhook");
}

export async function createWebhook(data: {
  event: string;
  endpoint: string;
  method?: WebhookMethod | null;
}) {
  await requireRoleCapability("admin", "admin.system");
  const result = await prisma.webhook.create({
    data: {
      event: data.event,
      endpoint: data.endpoint,
      method: data.method ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    }
  });
  revalidatePath("/admin/webhook");
  return { id: result.webhook_id };
}

export async function deleteWebhook(id: number) {
  await requireRoleCapability("admin", "admin.system");
  await prisma.webhook.delete({
    where: { webhook_id: id }
  });
  revalidatePath("/admin/webhook");
}
