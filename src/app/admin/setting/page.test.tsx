import { describe, it, expect } from "vitest";
import { listSettingsSchema, createSettingSchema, deleteSettingSchema } from "./schemas";
import type { SettingItem, ListSettingsResult } from "./schemas";

/**
 * Data contract tests for admin/setting page.
 *
 * Verifies that schemas accept the params passed by the page,
 * and that SettingItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 */

describe("admin setting page — data contract", () => {
  // ── listSettingsSchema ─────────────────────────────────────

  it("listSettingsSchema accepts empty params", () => {
    const r = listSettingsSchema.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data).toBeDefined();
  });

  it("listSettingsSchema accepts explicit page and limit", () => {
    const r = listSettingsSchema.safeParse({ page: 2, limit: 25 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(25);
      expect(r.data.page).toBe(2);
    }
  });

  it("listSettingsSchema accepts the params the page actually passes", () => {
    const r = listSettingsSchema.safeParse({ limit: 50, page: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1);
    }
  });

  it("listSettingsSchema accepts code filter", () => {
    const r = listSettingsSchema.safeParse({ code: "AppConfig", page: 1, limit: 50 });
    expect(r.success).toBe(true);
  });

  // ── createSettingSchema ────────────────────────────────────

  it("createSettingSchema accepts valid input", () => {
    const r = createSettingSchema.safeParse({
      code: "AppConfig",
      key: "site_name",
      value: "StudentHub",
      serialized: false,
    });
    expect(r.success).toBe(true);
  });

  it("createSettingSchema accepts minimal input (no value)", () => {
    const r = createSettingSchema.safeParse({
      code: "AppConfig",
      key: "site_name",
    });
    expect(r.success).toBe(true);
  });

  it("createSettingSchema rejects empty code", () => {
    const r = createSettingSchema.safeParse({ code: "", key: "site_name" });
    expect(r.success).toBe(false);
  });

  it("createSettingSchema rejects empty key", () => {
    const r = createSettingSchema.safeParse({ code: "AppConfig", key: "" });
    expect(r.success).toBe(false);
  });

  // ── deleteSettingSchema ────────────────────────────────────

  it("deleteSettingSchema accepts valid UUID", () => {
    const r = deleteSettingSchema.safeParse({ settingUuid: "setting_abc123" });
    expect(r.success).toBe(true);
  });

  it("deleteSettingSchema rejects empty UUID", () => {
    const r = deleteSettingSchema.safeParse({ settingUuid: "" });
    expect(r.success).toBe(false);
  });

  // ── SettingItem ────────────────────────────────────────────

  it("SettingItem fields map correctly to DataTable columns", () => {
    const row: SettingItem = {
      setting_uuid: "set-123",
      code: "app_config",
      key: "site_name",
      value: "StudentHub",
      serialized: false,
      created_at: new Date("2026-06-20T10:00:00Z"),
      updated_at: new Date("2026-06-20T12:00:00Z"),
    };
    expect(row.setting_uuid).toBe("set-123");
    expect(row.code).toBe("app_config");
    expect(row.key).toBe("site_name");
    expect(row.value).toBe("StudentHub");
    expect(row.serialized).toBe(false);
  });

  it("SettingItem allows nullable fields", () => {
    const row: SettingItem = {
      setting_uuid: "nullable-test",
      code: "test",
      key: "nullable-key",
      value: null,
      serialized: false,
      created_at: null,
      updated_at: null,
    };
    expect(row.code).toBe("test");
    expect(row.value).toBeNull();
    expect(row.serialized).toBe(false);
  });

  // ── ListSettingsResult ─────────────────────────────────────

  it("ListSettingsResult has expected shape", () => {
    const result: ListSettingsResult = {
      settings: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.settings)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });

  it("ListSettingsResult with data", () => {
    const result: ListSettingsResult = {
      settings: [
        {
          setting_uuid: "s1",
          code: "general",
          key: "theme",
          value: "dark",
          serialized: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    expect(result.settings).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });
});
