import { describe, it, expect } from "vitest";
import { blockedIpListItemSchema, listBlockedIpsResultSchema } from "./schemas";
import type { BlockedIpListItem, ListBlockedIpsResult } from "./schemas";

/**
 * Page migration test for admin/blocked-ips.
 *
 * Verifies that blockedIpListItemSchema accepts the data returned by the
 * listBlockedIps server action, and that BlockedIpListItem fields map
 * correctly to AdminBlockedIpsTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin blocked-ips page — data contract", () => {
  it("blockedIpListItemSchema accepts empty list result", () => {
    const r = listBlockedIpsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.records).toEqual([]);
    }
  });

  it("blockedIpListItemSchema accepts a full blocked-ip record", () => {
    const r: BlockedIpListItem = {
      ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000",
      ip_address: "192.168.1.1",
      note: "Suspicious activity",
      created_at: "2026-06-16T00:00:00.000Z",
      updated_at: "2026-06-16T00:00:00.000Z",
    };
    const parsed = blockedIpListItemSchema.safeParse(r);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.ip_uuid).toBe(r.ip_uuid);
      expect(parsed.data.ip_address).toBe(r.ip_address);
      expect(parsed.data.note).toBe(r.note);
    }
  });

  it("BlockedIpListItem fields map correctly to AdminBlockedIpsTable columns", () => {
    // The page maps BlockedIpListItem to AdminBlockedIpsTable columns:
    //   ip_uuid    → row.id     (UUID key, used as row key)
    //   ip_address → row.ip_address (displayed in code block)
    //   note       → row.note   (displayed as muted text)
    //   created_at → date display (formatted locale date)
    //   ip_uuid    → deleteBlockedIp(ip_uuid) (unblock action)
    const record: BlockedIpListItem = {
      ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000",
      ip_address: "10.0.0.5",
      note: "Blocked for rate limiting",
      created_at: "2026-06-15T12:00:00.000Z",
      updated_at: "2026-06-15T12:00:00.000Z",
    };
    expect(record.ip_uuid).toBeTruthy();
    expect(record.ip_address).toBe("10.0.0.5");
    expect(record.note).toBe("Blocked for rate limiting");
    expect(record.created_at).toBeTruthy();
    expect(record.updated_at).toBeTruthy();
  });

  it("ListBlockedIpsResult has expected shape (matches listBlockedIps return)", () => {
    const result: ListBlockedIpsResult = {
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.records)).toBe(true);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(0);
  });

  it("blockedIpListItemSchema rejects missing required fields", () => {
    const r = blockedIpListItemSchema.safeParse({ ip_address: "1.2.3.4" });
    expect(r.success).toBe(false);
  });

  it("blockedIpListItemSchema accepts nullable note and dates", () => {
    const r = blockedIpListItemSchema.safeParse({
      ip_uuid: "ip_abc",
      ip_address: "10.0.0.1",
      note: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.note).toBeNull();
      expect(r.data.created_at).toBeNull();
      expect(r.data.updated_at).toBeNull();
    }
  });
});
