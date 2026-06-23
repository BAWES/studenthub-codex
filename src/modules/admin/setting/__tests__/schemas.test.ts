import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  settingItemSchema,
  listSettingsResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: setting schema validation
//
// All admin actions in actions.ts use these zod schemas internally.
// Testing them separately avoids mocking "use server" dependencies (prisma,
// session, next/cache).
// ---------------------------------------------------------------------------

const validSettingItem = {
  setting_uuid: "abc-123",
  code: "general",
  key: "site_name",
  value: "StudentHub",
  serialized: false,
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-15"),
};

const validDetail = {
  setting_uuid: "abc-123",
  code: "general",
  key: "site_name",
  value: "StudentHub",
  serialized: false,
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-15"),
};

const settingDetailSchema = z.object({
  setting_uuid: z.string(),
  code: z.string(),
  key: z.string(),
  value: z.string().nullable(),
  serialized: z.boolean().nullable(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
});

const settingCreateResultSchema = z.object({
  setting_uuid: z.string(),
});

describe("settingItemSchema", () => {
  it("accepts a valid setting item", () => {
    const result = settingItemSchema.safeParse(validSettingItem);
    expect(result.success).toBe(true);
  });

  it("rejects missing required setting_uuid", () => {
    const { setting_uuid, ...incomplete } = validSettingItem;
    const result = settingItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects missing required code", () => {
    const { code, ...incomplete } = validSettingItem;
    const result = settingItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects non-string value", () => {
    const result = settingItemSchema.safeParse({
      ...validSettingItem,
      value: 123,
    });
    expect(result.success).toBe(false);
  });
});

describe("listSettingsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const result = listSettingsResultSchema.safeParse({
      settings: [validSettingItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty settings array", () => {
    const result = listSettingsResultSchema.safeParse({
      settings: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-array settings", () => {
    const result = listSettingsResultSchema.safeParse({
      settings: validSettingItem,
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("settingDetailSchema", () => {
  it("accepts a valid setting detail object", () => {
    const result = settingDetailSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("accepts null optional fields", () => {
    const result = settingDetailSchema.safeParse({
      ...validDetail,
      value: null,
      serialized: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = settingDetailSchema.safeParse({
      code: "general",
    });
    expect(result.success).toBe(false);
  });
});

describe("settingCreateResultSchema", () => {
  it("accepts a valid create result", () => {
    const result = settingCreateResultSchema.safeParse({
      setting_uuid: "new-uuid-here",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing setting_uuid", () => {
    const result = settingCreateResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string setting_uuid", () => {
    const result = settingCreateResultSchema.safeParse({ setting_uuid: 123 });
    expect(result.success).toBe(false);
  });
});
