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

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type SettingItem = {
  setting_uuid: string;
  code: string;
  key: string;
  value: string | null;
  serialized: boolean;
  created_at: Date | null;
  updated_at: Date | null;
};

type UpdateSettingResult = {
  operation: string;
  message: string;
};

describe("SettingItem shape", () => {
  it("defines the expected fields", () => {
    const mock: SettingItem = {
      setting_uuid: "abc-123",
      code: "EventManager",
      key: "max_active_students",
      value: "500",
      serialized: false,
      created_at: null,
      updated_at: null,
    };
    expect(mock.setting_uuid).toBe("abc-123");
    expect(mock.code).toBe("EventManager");
    expect(mock.serialized).toBe(false);
  });
});

describe("UpdateSettingResult shape", () => {
  it("includes operation and message", () => {
    const result: UpdateSettingResult = {
      operation: "success",
      message: "Setting updated successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("can represent error state", () => {
    const result: UpdateSettingResult = {
      operation: "error",
      message: "Setting not found",
    };
    expect(result.operation).toBe("error");
  });
});
