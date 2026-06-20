"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listWebhooksSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getWebhookSchema = z.object({
  id: z.coerce.number().int().positive(),
});

import {
  webhookListItemSchema,
  listWebhooksResultSchema,
  webhookActionResponseSchema,
  createWebhookSchema,
  updateWebhookSchema,
  deleteWebhookSchema,
} from "./schemas";
import type { WebhookListItem, ListWebhooksResult, WebhookActionResponse } from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List webhooks with pagination.
 * Mirrors the legacy Yii2 Admin WebhookController::actionList().
 */
export async function listWebhooks(
  params: FormData | z.input<typeof listWebhooksSchema> = {},
): Promise<ListWebhooksResult> {
  await requireCapability("admin.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listWebhooksSchema.safeParse(raw);
  if (!parsed.success) {
    return { webhooks: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [webhooks, total] = await Promise.all([
    prisma.webhook.findMany({
      orderBy: { webhook_id: "desc" },
      skip,
      take: limit,
    }),
    prisma.webhook.count(),
  ]);

  const result: ListWebhooksResult = {
    webhooks: webhooks.map((w): WebhookListItem => ({
      webhook_id: w.webhook_id,
      event: w.event,
      endpoint: w.endpoint,
      method: w.method ?? null,
      created_at: w.created_at?.toISOString() ?? null,
      updated_at: w.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listWebhooksResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/webhooks] listWebhooks output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single webhook by ID.
 * Mirrors the legacy Yii2 Admin WebhookController::actionView().
 */
export async function getWebhook(
  id: number,
): Promise<WebhookListItem | null> {
  await requireCapability("admin.read");

  const parsed = getWebhookSchema.safeParse({ id });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid webhook ID");
  }

  const webhook = await prisma.webhook.findFirst({
    where: { webhook_id: parsed.data.id },
  });

  if (!webhook) return null;

  const result: WebhookListItem = {
    webhook_id: webhook.webhook_id,
    event: webhook.event,
    endpoint: webhook.endpoint,
    method: webhook.method ?? null,
    created_at: webhook.created_at?.toISOString() ?? null,
    updated_at: webhook.updated_at?.toISOString() ?? null,
  };

  const outputParsed = webhookListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/webhooks] getWebhook output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// CRUD actions (create, update, delete)
// ---------------------------------------------------------------------------

/**
 * Create a new webhook.
 * Mirrors the legacy Yii2 Admin WebhookController::actionCreate().
 */
export async function createWebhook(
  event: string,
  endpoint: string,
  method?: string,
): Promise<WebhookActionResponse> {
  await requireCapability("admin.write");

  const parsed = createWebhookSchema.safeParse({ event, endpoint, method: method || undefined });
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid webhook parameters" };
  }

  try {
    await prisma.webhook.create({
      data: {
        event: parsed.data.event,
        endpoint: parsed.data.endpoint,
        method: parsed.data.method ?? null,
      },
    });

    revalidatePath("/admin/webhooks");
    const result: WebhookActionResponse = { operation: "success", message: "Webhook created successfully" };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/webhooks] createWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result: WebhookActionResponse = { operation: "error", message: "Failed to create webhook. Please try again." };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/webhooks] createWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

/**
 * Update an existing webhook.
 * Mirrors the legacy Yii2 Admin WebhookController::actionUpdate().
 */
export async function updateWebhook(
  webhookId: number,
  event: string,
  endpoint: string,
  method?: string,
): Promise<WebhookActionResponse> {
  await requireCapability("admin.write");

  const parsed = updateWebhookSchema.safeParse({ webhookId, event, endpoint, method: method || undefined });
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  }

  try {
    const existing = await prisma.webhook.findUnique({
      where: { webhook_id: parsed.data.webhookId },
      select: { webhook_id: true },
    });
    if (!existing) {
      return { operation: "error", message: "Webhook not found" };
    }

    await prisma.webhook.update({
      where: { webhook_id: parsed.data.webhookId },
      data: {
        event: parsed.data.event,
        endpoint: parsed.data.endpoint,
        method: parsed.data.method ?? null,
      },
    });

    revalidatePath("/admin/webhooks");
    revalidatePath(`/admin/webhooks/${parsed.data.webhookId}`);
    const result: WebhookActionResponse = { operation: "success", message: "Webhook successfully updated" };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/webhooks] updateWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result: WebhookActionResponse = { operation: "error", message: "Failed to update webhook. Please try again." };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/webhooks] updateWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

/**
 * Delete a webhook.
 * Mirrors the legacy Yii2 Admin WebhookController::actionDelete().
 */
export async function deleteWebhook(webhookId: number): Promise<WebhookActionResponse> {
  await requireCapability("admin.write");

  const parsed = deleteWebhookSchema.safeParse({ webhookId });
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid webhook ID" };
  }

  try {
    const existing = await prisma.webhook.findUnique({
      where: { webhook_id: parsed.data.webhookId },
      select: { webhook_id: true },
    });
    if (!existing) {
      return { operation: "error", message: "Webhook not found" };
    }

    await prisma.webhook.delete({ where: { webhook_id: parsed.data.webhookId } });

    revalidatePath("/admin/webhooks");
    const result: WebhookActionResponse = { operation: "success", message: "Webhook deleted successfully" };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/webhooks] deleteWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result: WebhookActionResponse = { operation: "error", message: "Failed to delete webhook. Please try again." };
    const outputParsed = webhookActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[modules/webhooks] deleteWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  }
}
