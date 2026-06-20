import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const xeroWebhookEventItemSchema = z.object({
  webhook_id: z.number().int().positive(),
  event: z.string(),
  created_at: z.string().nullable(),
});

export type XeroWebhookEventItem = z.output<typeof xeroWebhookEventItemSchema>;

export const listWebhookEventsResultSchema = z.object({
  events: z.array(xeroWebhookEventItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListWebhookEventsResult = z.output<
  typeof listWebhookEventsResultSchema
>;

export const processXeroWebhookResponseSchema = z.object({
  operation: z.string(),
  message: z.string(),
  processedCount: z.number().int().nonnegative(),
});

export type ProcessXeroWebhookResponse = z.output<
  typeof processXeroWebhookResponseSchema
>;

export const listWebhookEventsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const getWebhookEventSchema = z.object({
  id: z.coerce.number().int().positive(),
});