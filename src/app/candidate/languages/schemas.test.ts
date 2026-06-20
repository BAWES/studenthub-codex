import { describe, it, expect } from "vitest";
import {
  listLanguagesSchema,
  createLanguageSchema,
  languageItemOutputSchema,
  languageActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listLanguagesSchema
// ---------------------------------------------------------------------------
describe("listLanguagesSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listLanguagesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listLanguagesSchema.safeParse({ page: 2, limit: 50 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listLanguagesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listLanguagesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(listLanguagesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    expect(listLanguagesSchema.safeParse({ page: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createLanguageSchema
// ---------------------------------------------------------------------------
describe("createLanguageSchema", () => {
  it("accepts valid input", () => {
    expect(
      createLanguageSchema.safeParse({ language: "English", proficiency: "Advanced" }).success,
    ).toBe(true);
  });

  it("rejects missing language", () => {
    expect(createLanguageSchema.safeParse({ proficiency: "Advanced" }).success).toBe(false);
  });

  it("rejects missing proficiency", () => {
    expect(createLanguageSchema.safeParse({ language: "English" }).success).toBe(false);
  });

  it("rejects empty language", () => {
    expect(createLanguageSchema.safeParse({ language: "", proficiency: "Basic" }).success).toBe(false);
  });

  it("rejects empty proficiency", () => {
    expect(createLanguageSchema.safeParse({ language: "English", proficiency: "" }).success).toBe(false);
  });

  it("rejects language exceeding 128 characters", () => {
    expect(
      createLanguageSchema.safeParse({ language: "x".repeat(129), proficiency: "Basic" }).success,
    ).toBe(false);
  });

  it("rejects proficiency exceeding 32 characters", () => {
    expect(
      createLanguageSchema.safeParse({ language: "English", proficiency: "x".repeat(33) }).success,
    ).toBe(false);
  });

  it("rejects non-string language", () => {
    expect(createLanguageSchema.safeParse({ language: 123, proficiency: "Basic" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// languageItemOutputSchema (output)
// ---------------------------------------------------------------------------
describe("languageItemOutputSchema", () => {
  const validItem = {
    candidate_language_id: 1,
    language: "English",
    proficiency: "Advanced",
    candidate_language_created_at: new Date("2024-01-01"),
  };

  it("accepts a valid item", () => {
    expect(languageItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null created_at", () => {
    expect(
      languageItemOutputSchema.safeParse({ ...validItem, candidate_language_created_at: null }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_language_id", () => {
    const { candidate_language_id: _, ...rest } = validItem;
    expect(languageItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer candidate_language_id", () => {
    expect(
      languageItemOutputSchema.safeParse({ ...validItem, candidate_language_id: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects non-date created_at", () => {
    expect(
      languageItemOutputSchema.safeParse({ ...validItem, candidate_language_created_at: "2024-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// languageActionResultOutputSchema (output)
// ---------------------------------------------------------------------------
describe("languageActionResultOutputSchema", () => {
  it("accepts success response", () => {
    expect(
      languageActionResultOutputSchema.safeParse({ success: true, languageId: 1 }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      languageActionResultOutputSchema.safeParse({ success: false, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects success without languageId", () => {
    expect(
      languageActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error string", () => {
    expect(
      languageActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(
      languageActionResultOutputSchema.safeParse({ success: "true" }).success,
    ).toBe(false);
  });
});
