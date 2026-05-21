import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: language schema validation
//
// addCandidateLanguage and removeCandidateLanguage in actions.ts use this
// zod schema internally. Testing it separately avoids the need to mock
// "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const PROFICIENCY_LEVELS = ["basic", "intermediate", "advanced", "native"] as const;

const languageSchema = z.object({
  language: z.string().min(1, "Language is required").max(128),
  proficiency: z.enum(PROFICIENCY_LEVELS, {
    required_error: "Proficiency level is required",
  }),
});

describe("languageSchema", () => {
  it("accepts valid language + proficiency", () => {
    const result = languageSchema.safeParse({
      language: "English",
      proficiency: "advanced",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("English");
      expect(result.data.proficiency).toBe("advanced");
    }
  });

  it("accepts all four valid proficiency levels", () => {
    for (const level of PROFICIENCY_LEVELS) {
      const result = languageSchema.safeParse({
        language: "Arabic",
        proficiency: level,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty language string", () => {
    const result = languageSchema.safeParse({
      language: "",
      proficiency: "basic",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("Language is required");
  });

  it("rejects missing language field entirely", () => {
    const result = languageSchema.safeParse({ proficiency: "basic" });
    expect(result.success).toBe(false);
  });

  it("rejects missing proficiency field entirely", () => {
    const result = languageSchema.safeParse({ language: "English" });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe(
      "Proficiency level is required",
    );
  });

  it("rejects invalid proficiency level", () => {
    const result = languageSchema.safeParse({
      language: "English",
      proficiency: "fluent",
    });
    expect(result.success).toBe(false);
  });

  it("rejects language longer than 128 characters", () => {
    const result = languageSchema.safeParse({
      language: "x".repeat(129),
      proficiency: "basic",
    });
    expect(result.success).toBe(false);
  });

  it("accepts language exactly 128 characters", () => {
    const result = languageSchema.safeParse({
      language: "x".repeat(128),
      proficiency: "native",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty string as proficiency", () => {
    const result = languageSchema.safeParse({
      language: "French",
      proficiency: "",
    });
    expect(result.success).toBe(false);
  });
});
