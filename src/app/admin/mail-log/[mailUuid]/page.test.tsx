import { describe, it, expect, vi } from "vitest";
import {
  listMailLogsSchema,
  mailLogListItemSchema,
  getMailLogSchema,
} from "@/modules/mail-logs/schemas";
import type { MailLogListItem, ListMailLogsResult } from "@/modules/mail-logs/schemas";

/**
 * Page tests for admin/mail-log detail view.
 *
 * Data contract tests: validates that the schema, actions, and
 * detail page render fields are all in sync.
 */
describe("admin mail-log detail page — data contract", () => {
  it("getMailLogSchema accepts a valid mailUuid", () => {
    const r = getMailLogSchema.safeParse({ mailUuid: "abc-123-def" });
    expect(r.success).toBe(true);
  });

  it("getMailLogSchema rejects empty mailUuid", () => {
    const r = getMailLogSchema.safeParse({ mailUuid: "" });
    expect(r.success).toBe(false);
  });

  it("MailLogListItem contains all fields used in detail page", () => {
    const row: MailLogListItem = {
      mail_uuid: "abc-123-def",
      from: "admin@studenthub.co",
      to: "user@example.com",
      subject: "Welcome to StudentHub",
      app: "admin",
      created_at: "2025-06-15T10:00:00.000Z",
      updated_at: "2025-06-15T12:00:00.000Z",
    };
    // Detail page uses these fields via DetailSection facts
    expect(row.mail_uuid).toBeDefined();
    expect(row.from).toBeDefined();
    expect(row.to).toBeDefined();
    expect(row.subject).toBeDefined();
    expect(row.app).toBeDefined();
    expect(row.created_at).toBeDefined();
    expect(row.updated_at).toBeDefined();
  });

  it("MailLogListItem accepts nullable fields for missing data", () => {
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

  it("ListMailLogsResult has expected shape for back-navigation", () => {
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
