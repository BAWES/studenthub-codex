import { describe, it, expect } from "vitest";
import {
  listLanguagesSchema,
  createLanguageSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listLanguagesSchema
// ---------------------------------------------------------------------------

describe("listLanguagesSchema", () => {
  it("accepts empty input with defaults", () => {
    const result = listLanguagesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom page and limit", () => {
    const result = listLanguagesSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listLanguagesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listLanguagesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createLanguageSchema
// ---------------------------------------------------------------------------

describe("createLanguageSchema", () => {
  it("accepts valid language and proficiency", () => {
    const result = createLanguageSchema.safeParse({
      language: "English",
      proficiency: "Native",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty language", () => {
    const result = createLanguageSchema.safeParse({
      language: "",
      proficiency: "Native",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty proficiency", () => {
    const result = createLanguageSchema.safeParse({
      language: "English",
      proficiency: "",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from language", () => {
    const result = createLanguageSchema.safeParse({
      language: "  Arabic  ",
      proficiency: "Native",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("Arabic");
    }
  });

  it("rejects language over 128 characters", () => {
    const result = createLanguageSchema.safeParse({
      language: "x".repeat(129),
      proficiency: "Native",
    });
    expect(result.success).toBe(false);
  });

  it("rejects proficiency over 32 characters", () => {
    const result = createLanguageSchema.safeParse({
      language: "English",
      proficiency: "x".repeat(33),
    });
    expect(result.success).toBe(false);
  });
});
