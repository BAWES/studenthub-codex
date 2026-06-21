"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { listWebhooksSchema, createWebhookSchema, updateWebhookSchema, deleteWebhookSchema, listWebhooksResultSchema, webhookActionResponseSchema } from "./schemas";
import type { ListWebhooksInput, ListWebhooksResult, WebhookActionResponse } from "./schemas";

export async function listWebhooks(input: ListWebhooksInput = {}): Promise<ListWebhooksResult> {
  await requireCapability("admin.read");
  const parsed = listWebhooksSchema.safeParse(input);
  if (!parsed.success) return { webhooks: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.webhook.findMany({ orderBy: { webhook_id: "desc" }, skip, take: limit, select: { webhook_id: true, event: true, endpoint: true, method: true, created_at: true, updated_at: true } }),
    prisma.webhook.count(),
  ]);
  const webhooks = rows.map((row) => ({ webhook_id: row.webhook_id, event: row.event, endpoint: row.endpoint, method: row.method, created_at: row.created_at, updated_at: row.updated_at }));
  const result = { webhooks, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listWebhooksResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/webhook] listWebhooks output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function createWebhook(event: string, endpoint: string, method?: string): Promise<WebhookActionResponse> {
  await requireCapability("admin.write");
  const parsed = createWebhookSchema.safeParse({ event, endpoint, method: method || undefined });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid webhook parameters" };
  try {
    await prisma.webhook.create({
      data: {
        event: parsed.data.event,
        endpoint: parsed.data.endpoint,
        method: parsed.data.method ?? null,
      },
    });
    revalidatePath("/admin/webhook");
    const result = { operation: "success", message: "Webhook created successfully" };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/webhook] createWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem creating the webhook, please contact us for assistance." };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/webhook] createWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function updateWebhook(webhookId: number, event: string, endpoint: string, method?: string): Promise<WebhookActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateWebhookSchema.safeParse({ webhookId, event, endpoint, method: method || undefined });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  try {
    const existing = await prisma.webhook.findUnique({ where: { webhook_id: parsed.data.webhookId }, select: { webhook_id: true } });
    if (!existing) return { operation: "error", message: "Webhook not found" };
    await prisma.webhook.update({
      where: { webhook_id: parsed.data.webhookId },
      data: {
        event: parsed.data.event,
        endpoint: parsed.data.endpoint,
        method: parsed.data.method ?? null,
      },
    });
    revalidatePath("/admin/webhook");
    const result = { operation: "success", message: "Webhook successfully updated" };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/webhook] updateWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem updating the webhook, please contact us for assistance." };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/webhook] updateWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function deleteWebhook(webhookId: number): Promise<WebhookActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteWebhookSchema.safeParse({ webhookId });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid webhook ID" };
  try {
    const existing = await prisma.webhook.findUnique({ where: { webhook_id: parsed.data.webhookId }, select: { webhook_id: true } });
    if (!existing) return { operation: "error", message: "Webhook not found" };
    await prisma.webhook.delete({ where: { webhook_id: parsed.data.webhookId } });
    revalidatePath("/admin/webhook");
    const result = { operation: "success", message: "Webhook deleted successfully" };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/webhook] deleteWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem deleting the webhook, please contact us for assistance." };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/webhook] deleteWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  }
}
