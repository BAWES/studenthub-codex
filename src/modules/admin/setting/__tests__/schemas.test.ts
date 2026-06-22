import { describe, it, expect } from "vitest";
import {
  settingListItemSchema,
  listSettingsResultSchema,
  settingIdResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: setting schema validation
//
// All admin actions in actions.ts use these zod schemas internally.
// Testing them separately avoids mocking "use server" dependencies (prisma,
// session, next/cache).
// ---------------------------------------------------------------------------

const validSetting = {
  setting_uuid: "abc-123-def-456",
  code: "app",
  key: "site_name",
  value: "StudentHub",
  serialized: false,
  created_at: "2024-01-15T10:00:00.000Z",
  updated_at: "2024-01-15T10:00:00.000Z",
};

describe("settingListItemSchema", () => {
  it("accepts a valid setting with all fields", () => {
    const result = settingListItemSchema.safeParse(validSetting);
    expect(result.success).toBe(true);
  });

  it("accepts a setting with minimal fields (nulls for optionals)", () => {
    const minimal = {
      setting_uuid: "xyz-789",
      code: "email",
      key: "smtp_host",
      value: null,
      serialized: null,
      created_at: null,
      updated_at: null,
    };
    const result = settingListItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = settingListItemSchema.safeParse({
      code: "app",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string setting_uuid", () => {
    const result = settingListItemSchema.safeParse({
      ...validSetting,
      setting_uuid: 123,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string code", () => {
    const result = settingListItemSchema.safeParse({
      ...validSetting,
      code: 123,
    });
    expect(result.success).toBe(false);
  });
});

describe("listSettingsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const result = listSettingsResultSchema.safeParse({
      records: [validSetting],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    const result = listSettingsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listSettingsResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("settingIdResultSchema", () => {
  it("accepts a valid setting_uuid result", () => {
    const result = settingIdResultSchema.safeParse({ setting_uuid: "abc-123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.setting_uuid).toBe("abc-123");
    }
  });

  it("rejects non-string setting_uuid", () => {
    const result = settingIdResultSchema.safeParse({ setting_uuid: 123 });
    expect(result.success).toBe(false);
  });

  it("rejects missing setting_uuid", () => {
    const result = settingIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
