import { z } from "zod";

// ---------------------------------------------------------------------------
// Webhook Detail schemas — single-webhook detail page
// ---------------------------------------------------------------------------

/**
 * Input schema for getWebhook.
 */
export const getWebhookSchema = z.object({
  webhookId: z.coerce.number().int().positive("Webhook ID is required"),
});

/**
 * Schema for a single webhook item in detail response.
 */
export const webhookItemSchema = z.object({
  webhook_id: z.number().int().positive(),
  event: z.string().min(1),
  endpoint: z.string().min(1),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/**
 * Output schema for getWebhook.
 */
export const getWebhookResultSchema = z.object({
  webhook: webhookItemSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type WebhookItem = z.output<typeof webhookItemSchema>;
export type GetWebhookResult = z.output<typeof getWebhookResultSchema>;
export type GetWebhookInput = z.input<typeof getWebhookSchema>;
