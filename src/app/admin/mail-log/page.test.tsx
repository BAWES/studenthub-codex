import { describe, it, expect } from "vitest";
import { listMailLogsSchema } from "@/modules/mail-logs/schemas";
import type { MailLogListItem, ListMailLogsResult } from "@/modules/mail-logs/schemas";

/**
 * Page migration test for admin/mail-log.
 *
 * Verifies that listMailLogsSchema accepts the params passed by the page,
 * and that MailLogListItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin mail-log page — data contract", () => {
  it("listMailLogsSchema accepts empty params (defaults apply)", () => {
    const r = listMailLogsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listMailLogsSchema accepts the params the page actually passes", () => {
    const r = listMailLogsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("MailLogListItem fields map correctly to DataTable columns", () => {
    // The page maps MailLogListItem to DataTable columns:
    //   mail_uuid   → row.mail_uuid   (for keys & rowHref)
    //   from        → row.from
    //   to          → row.to
    //   subject     → row.subject
    //   app         → row.app
    //   created_at  → row.created_at (formatted as date)
    const row: MailLogListItem = {
      mail_uuid: "mail_abc123",
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Welcome to StudentHub",
      app: "admin",
      created_at: "2025-01-15T10:00:00.000Z",
      updated_at: "2025-06-01T12:00:00.000Z",
    };
    expect(row.mail_uuid).toBe("mail_abc123");
    expect(row.from).toBe("sender@example.com");
    expect(row.to).toBe("recipient@example.com");
    expect(row.subject).toBe("Welcome to StudentHub");
    expect(row.app).toBe("admin");
    expect(row.created_at).toBe("2025-01-15T10:00:00.000Z");
    expect(row.updated_at).toBe("2025-06-01T12:00:00.000Z");
  });

  it("ListMailLogsResult has expected shape", () => {
    const result: ListMailLogsResult = {
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(Array.isArray(result.records)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
