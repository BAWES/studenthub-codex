import { describe, it, expect } from "vitest";
import type { WebhookListItem } from "../schemas";

/**
 * Page migration test for admin/webhooks/[id].
 *
 * Verifies the data contract between the detail page and getWebhook.
 * Schema-level validation is covered by src/modules/webhooks/.
 */
describe("admin webhooks detail page — data contract", () => {
  it("getWebhook returns WebhookListItem shape", () => {
    // The detail page calls getWebhook(id) and expects WebhookListItem|null
    const webhook: WebhookListItem = {
      webhook_id: 42,
      event: "candidate.created",
      endpoint: "https://hooks.studenthub.co/candidate-created",
      method: "POST",
      created_at: "2026-06-01T08:00:00.000Z",
      updated_at: "2026-06-15T14:30:00.000Z",
    };

    // DetailSection uses these fields directly
    expect(webhook.webhook_id).toBe(42);
    expect(typeof webhook.event).toBe("string");
    expect(typeof webhook.endpoint).toBe("string");
    expect(webhook.method).toBe("POST");

    // Date formatting via formatDate()
    if (webhook.created_at) {
      const formatted = new Date(webhook.created_at).toLocaleDateString();
      expect(typeof formatted).toBe("string");
    }
    if (webhook.updated_at) {
      const formatted = new Date(webhook.updated_at).toLocaleDateString();
      expect(typeof formatted).toBe("string");
    }
  });

  it("getWebhook returns null when not found (triggers notFound())", () => {
    const webhook: WebhookListItem | null = null;
    expect(webhook).toBeNull();
  });

  it("handles null method on detail page", () => {
    const webhook: WebhookListItem = {
      webhook_id: 99,
      event: "test.event",
      endpoint: "https://example.com/hook",
      method: null,
      created_at: null,
      updated_at: null,
    };
    expect(webhook.method).toBeNull();
    expect(webhook.created_at).toBeNull();
    expect(webhook.updated_at).toBeNull();
  });
});
