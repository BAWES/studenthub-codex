import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  listSettingsSchema,
  getSettingSchema,
  updateSettingSchema,
  listSettingsResultSchema,
  updateSettingResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: settings schema validation
//
// listSettings/getSetting/updateSetting in actions.ts use these zod schemas
// internally. Testing them separately avoids mocking "use server"
// dependencies.
// ---------------------------------------------------------------------------

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
    const result = getSettingSchema.safeParse({
      settingUuid: "setting_abc123",
    });
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

// ---------------------------------------------------------------------------
// Output validation — listSettingsResultSchema
// ---------------------------------------------------------------------------

describe("listSettingsResultSchema", () => {
  it("accepts valid listSettings result", () => {
    const result = listSettingsResultSchema.safeParse({
      settings: [
        {
          setting_uuid: "setting_abc1",
          code: "EventManager",
          key: "max_active_students",
          value: "500",
          serialized: false,
          created_at: "2026-06-01T00:00:00.000Z",
          updated_at: "2026-06-01T00:00:00.000Z",
        },
      ],
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

  it("rejects negative total", () => {
    const result = listSettingsResultSchema.safeParse({
      settings: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing page field", () => {
    const result = listSettingsResultSchema.safeParse({
      settings: [],
      total: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing serialized field on setting item", () => {
    const result = listSettingsResultSchema.safeParse({
      settings: [
        {
          setting_uuid: "abc",
          code: "Test",
          key: "k",
          value: null,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts null dates", () => {
    const result = listSettingsResultSchema.safeParse({
      settings: [
        {
          setting_uuid: "abc",
          code: "Test",
          key: "k",
          value: null,
          serialized: false,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output validation — updateSettingResultSchema
// ---------------------------------------------------------------------------

describe("updateSettingResultSchema", () => {
  it("accepts success result", () => {
    const result = updateSettingResultSchema.safeParse({
      operation: "success",
      message: "Setting updated successfully",
    });
    expect(result.success).toBe(true);
  });

  it("accepts error result", () => {
    const result = updateSettingResultSchema.safeParse({
      operation: "error",
      message: "Setting not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = updateSettingResultSchema.safeParse({
      message: "Something",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = updateSettingResultSchema.safeParse({
      operation: "success",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty message (message is optional text)", () => {
    const result = updateSettingResultSchema.safeParse({
      operation: "success",
      message: "",
    });
    expect(result.success).toBe(true);
  });
});
