import { describe, it, expect } from "vitest";
import {
  getLanguageSchema,
  updateLanguageSchema,
  deleteLanguageSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/languages/[id] actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("getLanguageSchema", () => {
  it("accepts a valid positive integer ID", () => {
    expect(getLanguageSchema.safeParse({ languageId: 42 }).success).toBe(true);
  });

  it("rejects zero ID", () => {
    expect(getLanguageSchema.safeParse({ languageId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(getLanguageSchema.safeParse({ languageId: -1 }).success).toBe(false);
  });

  it("rejects non-integer ID", () => {
    expect(getLanguageSchema.safeParse({ languageId: 1.5 }).success).toBe(false);
  });

  it("rejects missing ID", () => {
    expect(getLanguageSchema.safeParse({}).success).toBe(false);
  });

  it("coerces string ID to number", () => {
    const r = getLanguageSchema.safeParse({ languageId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.languageId).toBe(42);
    }
  });
});

describe("updateLanguageSchema", () => {
  it("accepts valid language + proficiency", () => {
    const r = updateLanguageSchema.safeParse({
      languageId: 1,
      language: "English",
      proficiency: "advanced",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.language).toBe("English");
      expect(r.data.proficiency).toBe("advanced");
    }
  });

  it("accepts all four valid proficiency levels", () => {
    for (const level of ["basic", "intermediate", "advanced", "native"] as const) {
      expect(
        updateLanguageSchema.safeParse({
          languageId: 1,
          language: "Arabic",
          proficiency: level,
        }).success,
      ).toBe(true);
    }
  });

  it("rejects empty language string", () => {
    expect(
      updateLanguageSchema.safeParse({
        languageId: 1,
        language: "",
        proficiency: "basic",
      }).success,
    ).toBe(false);
  });

  it("rejects missing language field", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, proficiency: "basic" })
        .success,
    ).toBe(false);
  });

  it("rejects missing proficiency field", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "English" })
        .success,
    ).toBe(false);
  });

  it("rejects invalid proficiency level", () => {
    expect(
      updateLanguageSchema.safeParse({
        languageId: 1,
        language: "English",
        proficiency: "fluent",
      }).success,
    ).toBe(false);
  });

  it("rejects language longer than 128 characters", () => {
    expect(
      updateLanguageSchema.safeParse({
        languageId: 1,
        language: "x".repeat(129),
        proficiency: "native",
      }).success,
    ).toBe(false);
  });

  it("accepts language exactly 128 characters", () => {
    expect(
      updateLanguageSchema.safeParse({
        languageId: 1,
        language: "x".repeat(128),
        proficiency: "native",
      }).success,
    ).toBe(true);
  });

  it("coerces languageId from string", () => {
    const r = updateLanguageSchema.safeParse({
      languageId: "5",
      language: "French",
      proficiency: "native",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.languageId).toBe(5);
    }
  });

  it("trims whitespace from language", () => {
    const r = updateLanguageSchema.safeParse({
      languageId: 1,
      language: "  English  ",
      proficiency: "native",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.language).toBe("English");
    }
  });
});

describe("deleteLanguageSchema", () => {
  it("accepts a valid positive integer ID", () => {
    expect(deleteLanguageSchema.safeParse({ languageId: 10 }).success).toBe(
      true,
    );
  });

  it("rejects zero ID", () => {
    expect(deleteLanguageSchema.safeParse({ languageId: 0 }).success).toBe(
      false,
    );
  });

  it("rejects missing ID", () => {
    expect(deleteLanguageSchema.safeParse({}).success).toBe(false);
  });

  it("coerces string ID to number", () => {
    const r = deleteLanguageSchema.safeParse({ languageId: "7" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.languageId).toBe(7);
    }
  });
});
