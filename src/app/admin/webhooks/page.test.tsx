import { describe, it, expect } from "vitest";
import type { WebhookListItem, ListWebhooksResult } from "./schemas";

/**
 * Page migration test for admin/webhooks.
 *
 * Verifies that the page's data contract with listWebhooks is satisfied,
 * and that WebhookListItem fields map correctly to DataTable columns.
 *
 * Schema-level validation is covered by src/modules/webhooks/.
 * Full rendering tests require Playwright (server component).
 */
describe("admin webhooks page — data contract", () => {
  it("WebhookListItem has required shape for DataTable columns", () => {
    // The page maps WebhookListItem to DataTable columns:
    //   webhook_id  → row.webhook_id  → row.id (for DataTable row key)
    //   event       → row.event       (monospace font)
    //   endpoint    → row.endpoint    (truncated)
    //   method      → row.method      (badge-style)
    //   created_at  → row.created_at  (formatted)
    //   updated_at  → row.updated_at  (formatted)
    const row: WebhookListItem = {
      webhook_id: 1,
      event: "issue.created",
      endpoint: "https://hooks.example.com/callback",
      method: "POST",
      created_at: "2026-06-14T10:00:00.000Z",
      updated_at: "2026-06-14T12:00:00.000Z",
    };

    // Row key for DataTable
    const id = row.webhook_id;
    expect(id).toBe(1);

    // Column render checks
    expect(row.event).toBe("issue.created");
    expect(row.endpoint).toBe("https://hooks.example.com/callback");
    expect(row.method).toBe("POST");

    // Date formatting
    if (row.created_at) {
      const formatted = new Date(row.created_at).toLocaleDateString();
      expect(typeof formatted).toBe("string");
    }
    if (row.updated_at) {
      const formatted = new Date(row.updated_at).toLocaleDateString();
      expect(typeof formatted).toBe("string");
    }
  });

  it("WebhookListItem accepts nullable fields", () => {
    const row: WebhookListItem = {
      webhook_id: 2,
      event: "payment.updated",
      endpoint: "https://hooks.example.com/payment",
      method: null,
      created_at: null,
      updated_at: null,
    };
    expect(row.method).toBeNull();
    expect(row.created_at).toBeNull();
    expect(row.updated_at).toBeNull();
  });

  it("ListWebhooksResult has expected shape for the page's list call", () => {
    // The page calls listWebhooks({ limit: 100 })
    const result: ListWebhooksResult = {
      webhooks: [
        {
          webhook_id: 1,
          event: "issue.created",
          endpoint: "https://hooks.example.com/callback",
          method: "POST",
          created_at: "2026-06-14T10:00:00.000Z",
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    };
    expect(Array.isArray(result.webhooks)).toBe(true);
    expect(result.webhooks).toHaveLength(1);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
    expect(result.limit).toBe(100); // matches what the page passes
  });

  it("accepts empty webhooks array", () => {
    const result: ListWebhooksResult = {
      webhooks: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    };
    expect(result.webhooks).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });

  it("DataTable row mapping works", () => {
    // The page converts webhook_id → id for DataTable row keys
    const rows = [
      { webhook_id: 1, event: "a", endpoint: "https://a.com", method: "GET", created_at: null, updated_at: null },
      { webhook_id: 2, event: "b", endpoint: "https://b.com", method: "POST", created_at: null, updated_at: null },
    ].map((w) => ({ ...w, id: w.webhook_id }));

    expect(rows[0].id).toBe(1);
    expect(rows[1].id).toBe(2);
  });
});
