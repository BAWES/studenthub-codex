import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: settings schema validation
//
// listSettings/getSetting/updateSetting in actions.ts use these zod schemas
// internally. Testing them separately avoids mocking "use server"
// dependencies.
// ---------------------------------------------------------------------------

const listSettingsSchema = z.object({
  code: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getSettingSchema = z.object({
  settingUuid: z.string().min(1, "Setting UUID is required"),
});

const updateSettingSchema = z.object({
  settingUuid: z.string().min(1, "Setting UUID is required"),
  value: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// listSettingsSchema
// ---------------------------------------------------------------------------

describe("listSettingsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listSettingsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts code filter", () => {
    const result = listSettingsSchema.safeParse({ code: "EventManager" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listSettingsSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listSettingsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listSettingsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listSettingsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getSettingSchema
// ---------------------------------------------------------------------------

describe("getSettingSchema", () => {
  it("accepts a valid setting UUID", () => {
    const result = getSettingSchema.safeParse({ settingUuid: "setting_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getSettingSchema.safeParse({ settingUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getSettingSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateSettingSchema
// ---------------------------------------------------------------------------

describe("updateSettingSchema", () => {
  it("accepts valid UUID and string value", () => {
    const result = updateSettingSchema.safeParse({
      settingUuid: "setting_abc123",
      value: "new value",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid UUID and null value", () => {
    const result = updateSettingSchema.safeParse({
      settingUuid: "setting_abc123",
      value: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = updateSettingSchema.safeParse({
      settingUuid: "",
      value: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateSettingSchema.safeParse({
      value: "test",
    });
    expect(result.success).toBe(false);
  });
});
