// ---------------------------------------------------------------------------
// Admin Webhooks - barrel exports
// ---------------------------------------------------------------------------

export {
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
} from "./actions";

export type {
  ListWebhooksInput,
  CreateWebhookInput,
  UpdateWebhookInput,
  DeleteWebhookInput,
  WebhookItem,
  ListWebhooksResult,
  WebhookActionResponse,
} from "./schemas";

export {
  listWebhooksSchema,
  createWebhookSchema,
  updateWebhookSchema,
  deleteWebhookSchema,
  webhookItemSchema,
  listWebhooksResultSchema,
  webhookActionResponseSchema,
} from "./schemas";
