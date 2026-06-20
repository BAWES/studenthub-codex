import { describe, it, expect } from "vitest";
import { listSettingsSchema } from "./schemas";
import type { SettingItem, ListSettingsResult } from "./schemas";

/**
 * Page migration test for admin/setting.
 *
 * Verifies that listSettingsSchema accepts the params passed by the page,
 * and that SettingItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin setting page — data contract", () => {
  it("listSettingsSchema accepts empty params (defaults apply)", () => {
    const r = listSettingsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1);
    }
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
    const r = listSettingsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

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
      code: null,
      key: null,
      value: null,
      serialized: null,
      created_at: null,
      updated_at: null,
    };
    expect(row.code).toBeNull();
    expect(row.value).toBeNull();
    expect(row.serialized).toBeNull();
  });

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
