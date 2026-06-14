import { describe, it, expect } from "vitest";
import {
  mailLogListItemSchema,
  listMailLogsResultSchema,
} from "./schemas";

const validItem = () => ({
  mail_uuid: "mail-001",
  from: "sender@example.com",
  to: null,
  subject: "Welcome to StudentHub",
  app: null,
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// mailLogListItemSchema
// ---------------------------------------------------------------------------

describe("mailLogListItemSchema", () => {
  it("accepts a valid item", () => {
    const r = mailLogListItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = mailLogListItemSchema.safeParse({
      ...validItem(),
      from: null,
      to: null,
      subject: null,
      app: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing mail_uuid", () => {
    const { mail_uuid: _, ...rest } = validItem();
    expect(mailLogListItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listMailLogsResultSchema
// ---------------------------------------------------------------------------

describe("listMailLogsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listMailLogsResultSchema.safeParse({
      records: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty records array", () => {
    expect(
      listMailLogsResultSchema.safeParse({ records: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listMailLogsResultSchema.safeParse({ records: [], total: -1, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(false);
  });
});
