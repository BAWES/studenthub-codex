import { describe, it, expect } from "vitest";
import {
  getLanguageSchema,
  updateLanguageSchema,
  deleteLanguageSchema,
  languageItemOutputSchema,
  languageDetailResponseOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getLanguageSchema
// ---------------------------------------------------------------------------
describe("getLanguageSchema", () => {
  it("accepts valid input", () => {
    expect(getLanguageSchema.safeParse({ languageId: 1 }).success).toBe(true);
  });

  it("rejects missing languageId", () => {
    expect(getLanguageSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero languageId", () => {
    expect(getLanguageSchema.safeParse({ languageId: 0 }).success).toBe(false);
  });

  it("rejects negative languageId", () => {
    expect(getLanguageSchema.safeParse({ languageId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric languageId", () => {
    expect(getLanguageSchema.safeParse({ languageId: "abc" }).success).toBe(false);
  });

  it("accepts coerced numeric string", () => {
    expect(getLanguageSchema.safeParse({ languageId: "5" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateLanguageSchema
// ---------------------------------------------------------------------------
describe("updateLanguageSchema", () => {
  it("accepts valid input with basic proficiency", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "English", proficiency: "basic" }).success,
    ).toBe(true);
  });

  it("accepts valid input with intermediate proficiency", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "French", proficiency: "intermediate" }).success,
    ).toBe(true);
  });

  it("accepts valid input with advanced proficiency", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "Spanish", proficiency: "advanced" }).success,
    ).toBe(true);
  });

  it("accepts valid input with native proficiency", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "German", proficiency: "native" }).success,
    ).toBe(true);
  });

  it("rejects missing languageId", () => {
    expect(
      updateLanguageSchema.safeParse({ language: "English", proficiency: "basic" }).success,
    ).toBe(false);
  });

  it("rejects zero languageId", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 0, language: "English", proficiency: "basic" }).success,
    ).toBe(false);
  });

  it("rejects missing language", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, proficiency: "basic" }).success,
    ).toBe(false);
  });

  it("rejects empty language", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "", proficiency: "basic" }).success,
    ).toBe(false);
  });

  it("rejects missing proficiency", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "English" }).success,
    ).toBe(false);
  });

  it("rejects invalid proficiency level", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "English", proficiency: "fluent" }).success,
    ).toBe(false);
  });

  it("rejects language exceeding 128 characters", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: "x".repeat(129), proficiency: "basic" }).success,
    ).toBe(false);
  });

  it("rejects non-string language", () => {
    expect(
      updateLanguageSchema.safeParse({ languageId: 1, language: 123, proficiency: "basic" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteLanguageSchema
// ---------------------------------------------------------------------------
describe("deleteLanguageSchema", () => {
  it("accepts valid input", () => {
    expect(deleteLanguageSchema.safeParse({ languageId: 1 }).success).toBe(true);
  });

  it("rejects missing languageId", () => {
    expect(deleteLanguageSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero languageId", () => {
    expect(deleteLanguageSchema.safeParse({ languageId: 0 }).success).toBe(false);
  });

  it("rejects negative languageId", () => {
    expect(deleteLanguageSchema.safeParse({ languageId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// languageItemOutputSchema (output, re-exported from parent)
// ---------------------------------------------------------------------------
describe("languageItemOutputSchema (re-exported)", () => {
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
});

// ---------------------------------------------------------------------------
// languageDetailResponseOutputSchema (output)
// ---------------------------------------------------------------------------
describe("languageDetailResponseOutputSchema", () => {
  const validDataItem = {
    candidate_language_id: 1,
    language: "English",
    proficiency: "Advanced",
    candidate_language_created_at: new Date("2024-01-01"),
  };

  it("accepts success response with data", () => {
    expect(
      languageDetailResponseOutputSchema.safeParse({ data: validDataItem, error: null }).success,
    ).toBe(true);
  });

  it("accepts error response with null data", () => {
    expect(
      languageDetailResponseOutputSchema.safeParse({ data: null, error: "Not found" }).success,
    ).toBe(true);
  });

  it("accepts error response with null error", () => {
    expect(
      languageDetailResponseOutputSchema.safeParse({ data: null, error: null }).success,
    ).toBe(true);
  });

  it("rejects missing data", () => {
    expect(
      languageDetailResponseOutputSchema.safeParse({ error: null }).success,
    ).toBe(false);
  });

  it("rejects missing error", () => {
    expect(
      languageDetailResponseOutputSchema.safeParse({ data: null }).success,
    ).toBe(false);
  });

  it("rejects both data and error populated", () => {
    expect(
      languageDetailResponseOutputSchema.safeParse({ data: validDataItem, error: "Something" }).success,
    ).toBe(false);
  });

  it("rejects wrong shape in data", () => {
    expect(
      languageDetailResponseOutputSchema.safeParse({ data: { foo: "bar" }, error: null }).success,
    ).toBe(false);
  });
});
