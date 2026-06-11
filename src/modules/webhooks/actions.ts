"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listWebhooksResultSchema,
  webhookGetResultSchema,
  webhookListItemSchema,
} from "./schemas";
import type { WebhookListItem, ListWebhooksResult, WebhookGetResult } from "./schemas";

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
): Promise<WebhookGetResult> {
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

  const outputParsed = webhookGetResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/webhooks] getWebhook output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
