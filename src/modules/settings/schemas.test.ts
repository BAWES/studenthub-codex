import { describe, it, expect } from "vitest";
import {
  settingItemSchema,
  listSettingsResultSchema,
  updateSettingResultSchema,
} from "./schemas";

describe("settingItemSchema", () => {
  const valid = {
    setting_uuid: "st-uuid-1", code: "APP_NAME", key: "app_name",
    value: "StudentHub", serialized: false,
    created_at: new Date("2026-01-01"), updated_at: new Date("2026-06-01"),
  };
  it("accepts a valid setting item", () => expect(settingItemSchema.safeParse(valid).success).toBe(true));
  it("accepts nullable fields as null", () => {
    expect(settingItemSchema.safeParse({ ...valid, value: null, created_at: null, updated_at: null }).success).toBe(true);
  });
  it("rejects missing setting_uuid", () => {
    const { setting_uuid: _, ...rest } = valid;
    expect(settingItemSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects non-boolean serialized", () => {
    expect(settingItemSchema.safeParse({ ...valid, serialized: "true" }).success).toBe(false);
  });
});

describe("listSettingsResultSchema", () => {
  const valid = () => ({
    settings: [{ setting_uuid: "s-1", code: "C", key: "c", value: null, serialized: false, created_at: null, updated_at: null }],
    total: 1, page: 1, limit: 20, totalPages: 1,
  });
  it("accepts a valid result", () => expect(listSettingsResultSchema.safeParse(valid()).success).toBe(true));
  it("accepts empty settings", () => expect(listSettingsResultSchema.safeParse({ ...valid(), settings: [] }).success).toBe(true));
  it("rejects missing settings", () => {
    const { settings: _, ...rest } = valid();
    expect(listSettingsResultSchema.safeParse(rest).success).toBe(false);
  });
});

describe("updateSettingResultSchema", () => {
  it("accepts a valid result", () => {
    expect(updateSettingResultSchema.safeParse({ operation: "update", message: "Done" }).success).toBe(true);
  });
  it("rejects missing operation", () => expect(updateSettingResultSchema.safeParse({ message: "X" }).success).toBe(false));
  it("rejects missing message", () => expect(updateSettingResultSchema.safeParse({ operation: "update" }).success).toBe(false));
});
