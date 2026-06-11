import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const webhookListItemSchema = z.object({
  webhook_id: z.number().int().positive(),
  event: z.string(),
  endpoint: z.string(),
  method: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type WebhookListItem = z.output<typeof webhookListItemSchema>;

export const listWebhooksResultSchema = z.object({
  webhooks: z.array(webhookListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListWebhooksResult = z.output<typeof listWebhooksResultSchema>;
