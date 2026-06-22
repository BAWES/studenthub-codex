import { describe, it, expect } from "vitest";
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

const validSettingListItem = {
  id: "abc-123",
  code: "general",
  key: "site_name",
  value: "StudentHub",
  serialized: "No",
  updated: "2025-01-15 10:30:00",
};

describe("settingItemSchema", () => {
  it("accepts a valid setting list item", () => {
    const result = settingItemSchema.safeParse(validSettingListItem);
    expect(result.success).toBe(true);
  });

  it("rejects missing required id", () => {
    const { id, ...incomplete } = validSettingListItem;
    const result = settingItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects missing required code", () => {
    const { code, ...incomplete } = validSettingListItem;
    const result = settingItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects non-string value", () => {
    const result = settingItemSchema.safeParse({
      ...validSettingListItem,
      value: 123,
    });
    expect(result.success).toBe(false);
  });
});

describe("listSettingsResultSchema", () => {
  it("accepts an array of valid setting list items", () => {
    const result = listSettingsResultSchema.safeParse([validSettingListItem]);
    expect(result.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const result = listSettingsResultSchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it("rejects non-array input", () => {
    const result = listSettingsResultSchema.safeParse(validSettingListItem);
    expect(result.success).toBe(false);
  });
});
