import { z } from "zod";

export const listWebhooksSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const webhookMethodEnum = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

export const createWebhookSchema = z.object({
  event: z.string().min(1, "Event is required").max(50),
  endpoint: z.string().min(1, "Endpoint is required").max(255),
  method: webhookMethodEnum.optional(),
});

export const updateWebhookSchema = z.object({
  webhookId: z.coerce.number().int().positive("Webhook ID is required"),
  event: z.string().min(1, "Event is required").max(50),
  endpoint: z.string().min(1, "Endpoint is required").max(255),
  method: webhookMethodEnum.optional(),
});

export const deleteWebhookSchema = z.object({
  webhookId: z.coerce.number().int().positive("Webhook ID is required"),
});

export const webhookItemSchema = z.object({
  webhook_id: z.number().int().positive(),
  event: z.string().min(1),
  endpoint: z.string().min(1),
  method: webhookMethodEnum.nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const listWebhooksResultSchema = z.object({
  webhooks: z.array(webhookItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const webhookActionResponseSchema = z.object({
  operation: z.string().min(1),
  message: z.string().min(1),
});

export type ListWebhooksInput = z.input<typeof listWebhooksSchema>;
export type CreateWebhookInput = z.input<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.input<typeof updateWebhookSchema>;
export type DeleteWebhookInput = z.input<typeof deleteWebhookSchema>;
export type WebhookMethod = z.output<typeof webhookMethodEnum>;

export type WebhookItem = z.output<typeof webhookItemSchema>;
export type ListWebhooksResult = z.output<typeof listWebhooksResultSchema>;
export type WebhookActionResponse = z.output<typeof webhookActionResponseSchema>;
