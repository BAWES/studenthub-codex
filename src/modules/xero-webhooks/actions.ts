"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// XeroWebhookController — incoming Xero webhook handling
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/XeroWebhookController.php
//
// Actions:
//   - listXeroWebhookEvents — list logged Xero webhook events
//   - getXeroWebhookEvent   — get a single webhook event by ID
//   - processXeroWebhook    — verify HMAC signature and process incoming events
//
// Xero webhook events are stored in the webhook model for audit trail.
// Environment variables:
//   XERO_WEBHOOK_KEY — shared secret key for HMAC verification (defaults to legacy value)
// ---------------------------------------------------------------------------

import {
  getWebhookEventSchema,
  listWebhookEventsResultSchema,
  listWebhookEventsSchema,
  processXeroWebhookResponseSchema,
  xeroWebhookEventItemSchema,
} from "./schemas";
import type {
  ListWebhookEventsResult,
  ProcessXeroWebhookResponse,
  XeroWebhookEventItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function verifySignature(
  body: string,
  signature: string | null,
  key: string,
): boolean {
  if (!signature) return false;
  const generated = crypto
    .createHmac("sha256", key)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List Xero webhook events with pagination.
 */
export async function listXeroWebhookEvents(
  params: z.input<typeof listWebhookEventsSchema> = {},
): Promise<ListWebhookEventsResult> {
  await requireCapability("admin.read");

  const parsed = listWebhookEventsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { page, limit } = parsed.data;

  const [events, total] = await Promise.all([
    prisma.webhook.findMany({
      where: { event: { startsWith: "xero_" } } as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.webhook.count({
      where: { event: { startsWith: "xero_" } } as any,
    }),
  ]);

  const result: ListWebhookEventsResult = {
    events: events.map((e) => ({
      webhook_id: e.webhook_id,
      event: e.event,
      created_at: e.created_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listWebhookEventsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/xero-webhooks] listXeroWebhookEvents output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single Xero webhook event by ID.
 */
export async function getXeroWebhookEvent(
  params: z.input<typeof getWebhookEventSchema>,
): Promise<XeroWebhookEventItem | null> {
  await requireCapability("admin.read");

  const parsed = getWebhookEventSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid webhook event ID",
    );
  }

  const { id } = parsed.data;

  const event = await prisma.webhook.findFirst({
    where: { webhook_id: id, event: { startsWith: "xero_" } } as any,
  });

  if (!event) return null;

  const result: XeroWebhookEventItem = {
    webhook_id: event.webhook_id,
    event: event.event,
    created_at: event.created_at?.toISOString() ?? null,
  };

  const outputParsed = xeroWebhookEventItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/xero-webhooks] getXeroWebhookEvent output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Process incoming Xero webhook events.
 *
 * Verifies the HMAC-SHA256 signature from the x-xero-signature header,
 * then logs each event in the webhook table for audit trail.
 *
 * @param events - Array of Xero webhook event objects with eventCategory and eventType
 * @param signature - The x-xero-signature header value for HMAC verification
 * @param rawBody - The raw request body string used for HMAC computation
 */
export async function processXeroWebhook(
  events: Array<{ eventCategory?: string; eventType?: string; resourceUrl?: string }>,
  signature: string | null,
  rawBody?: string,
): Promise<ProcessXeroWebhookResponse> {
  const webhookKey =
    process.env.XERO_WEBHOOK_KEY ??
    "+E4OxefKZm8uPKkiz8RkGA8t/XogInNgvIZhX9izCliOMVCerc8114/T7JSxudGfPxfwU1N3UCe1Ika2VuKDbQ==";

  // Verify HMAC signature
  if (rawBody && signature) {
    if (!verifySignature(rawBody, signature, webhookKey)) {
      const result: ProcessXeroWebhookResponse = {
        operation: "error",
        message: "Signature mismatch",
        processedCount: 0,
      };
      const outputParsed = processXeroWebhookResponseSchema.safeParse(result);
      if (!outputParsed.success) {
        console.error(
          "[modules/xero-webhooks] processXeroWebhook output validation failed:",
          outputParsed.error.issues,
        );
      }
      return result;
    }
  }

  if (!Array.isArray(events) || events.length === 0) {
    const result: ProcessXeroWebhookResponse = {
      operation: "error",
      message: "No events provided",
      processedCount: 0,
    };
    const outputParsed = processXeroWebhookResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/xero-webhooks] processXeroWebhook output validation failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  let processedCount = 0;

  for (const event of events) {
    try {
      const eventDescription = [event.eventCategory ?? "", event.eventType ?? ""]
        .filter(Boolean)
        .join(" ");

      await prisma.webhook.create({
        data: {
          webhook_id: 0, // auto-increment
          event: `xero_${eventDescription || "unknown"}`.slice(0, 50),
          endpoint: event.resourceUrl?.slice(0, 255) ?? "",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      processedCount++;
    } catch {
      // Skip individual failures
      continue;
    }
  }

  const result: ProcessXeroWebhookResponse = {
    operation: "success",
    message: `Processed ${processedCount} Xero webhook events`,
    processedCount,
  };
  const outputParsed = processXeroWebhookResponseSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/xero-webhooks] processXeroWebhook output validation failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}
