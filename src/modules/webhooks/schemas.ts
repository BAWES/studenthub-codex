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

/** Nullable webhook item result for getWebhook (returns null when not found) */
export const webhookGetResultSchema = webhookListItemSchema.nullable();

export type WebhookGetResult = z.output<typeof webhookGetResultSchema>;

// ---------------------------------------------------------------------------
// CRUD schemas
// ---------------------------------------------------------------------------

export const webhookMethodEnum = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

export const createWebhookSchema = z.object({
  event: z.string().min(1, "Event is required").max(50),
  endpoint: z.string().min(1, "Endpoint is required").max(255),
  method: webhookMethodEnum.optional(),
});

export type CreateWebhookInput = z.input<typeof createWebhookSchema>;

export const updateWebhookSchema = z.object({
  webhookId: z.coerce.number().int().positive("Webhook ID is required"),
  event: z.string().min(1, "Event is required").max(50),
  endpoint: z.string().min(1, "Endpoint is required").max(255),
  method: webhookMethodEnum.optional(),
});

export type UpdateWebhookInput = z.input<typeof updateWebhookSchema>;

export const deleteWebhookSchema = z.object({
  webhookId: z.coerce.number().int().positive("Webhook ID is required"),
});

export type DeleteWebhookInput = z.input<typeof deleteWebhookSchema>;

export const webhookActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type WebhookActionResponse = z.output<typeof webhookActionResponseSchema>;
