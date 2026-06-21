import { describe, it, expect } from "vitest";
import {
  settingSchema,
  settingsListResultSchema,
  settingUpdateSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: setting schema validation
//
// All admin settings actions use these zod schemas internally.
// Testing them separately avoids mocking "use server" dependencies (prisma,
// session, next/cache).
// ---------------------------------------------------------------------------

const validSetting = {
  setting_uuid: "abc123def456",
  code: "app",
  key: "site_name",
  value: "StudentHub",
  serialized: false,
};

describe("settingSchema", () => {
  it("accepts a valid setting with all fields", () => {
    const result = settingSchema.safeParse(validSetting);
    expect(result.success).toBe(true);
  });

  it("accepts a setting with a null value", () => {
    const result = settingSchema.safeParse({
      ...validSetting,
      value: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing setting_uuid", () => {
    const result = settingSchema.safeParse({
      code: "app",
      key: "site_name",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean serialized", () => {
    const result = settingSchema.safeParse({
      ...validSetting,
      serialized: "yes",
    });
    expect(result.success).toBe(false);
  });
});

describe("settingsListResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const result = settingsListResultSchema.safeParse({
      records: [validSetting],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    const result = settingsListResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = settingsListResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("settingUpdateSchema", () => {
  it("accepts a valid update payload", () => {
    const result = settingUpdateSchema.safeParse({
      value: "New Value",
      serialized: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an update with just value", () => {
    const result = settingUpdateSchema.safeParse({
      value: "Just the value",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty value", () => {
    const result = settingUpdateSchema.safeParse({
      value: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = settingUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
