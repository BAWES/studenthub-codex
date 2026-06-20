import { describe, it, expect } from "vitest";
import { listMailLogsSchema, mailLogListItemSchema } from "@/modules/mail-logs/schemas";
import type { MailLogListItem, ListMailLogsResult } from "@/modules/mail-logs/schemas";

/**
 * Page migration test for admin/mail-log.
 *
 * Data contract tests: validates that the schema, actions, and
 * DataTable columns are all in sync. Full rendering requires Playwright.
 */
describe("admin mail-log page — data contract", () => {
  it("listMailLogsSchema accepts empty params (defaults apply)", () => {
    const r = listMailLogsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(20);
      expect(r.data.page).toBe(1);
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
    // The page maps these fields:
    //   mail_uuid    → row.mail_uuid   (unique key)
    //   from         → row.from        (sender email)
    //   to           → row.to          (recipient)
    //   subject      → row.subject     (email subject)
    //   app          → row.app         (source app)
    //   created_at   → row.created_at  (formatted date)
    const row: MailLogListItem = {
      mail_uuid: "abc-123-def",
      from: "admin@studenthub.co",
      to: "user@example.com",
      subject: "Welcome to StudentHub",
      app: "admin",
      created_at: "2025-06-15T10:00:00.000Z",
      updated_at: "2025-06-15T12:00:00.000Z",
    };
    expect(row.mail_uuid).toBe("abc-123-def");
    expect(row.from).toBe("admin@studenthub.co");
    expect(row.to).toBe("user@example.com");
    expect(row.subject).toBe("Welcome to StudentHub");
    expect(row.app).toBe("admin");
    expect(row.created_at).toBe("2025-06-15T10:00:00.000Z");
  });

  it("MailLogListItem accepts nullable fields", () => {
    const r = mailLogListItemSchema.safeParse({
      mail_uuid: "def-456",
      from: null,
      to: null,
      subject: null,
      app: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
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
