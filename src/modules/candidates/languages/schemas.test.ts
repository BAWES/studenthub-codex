import { describe, it, expect } from "vitest";
import {
  listLanguagesSchema,
  getLanguageSchema,
  createLanguageSchema,
  updateLanguageSchema,
  deleteLanguageSchema,
  languageItemSchema,
  languageActionResultSchema,
  languageDetailResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listLanguagesSchema", () => {
  it("accepts empty input (defaults)", () => {
    const r = listLanguagesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const r = listLanguagesSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(1);
  });

  it("rejects limit over 100", () => {
    expect(listLanguagesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getLanguageSchema", () => {
  it("accepts valid input", () => {
    expect(getLanguageSchema.safeParse({ candidateId: 1, languageId: 5 }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getLanguageSchema.safeParse({ languageId: 5 }).success).toBe(false);
  });

  it("rejects missing languageId", () => {
    expect(getLanguageSchema.safeParse({ candidateId: 1 }).success).toBe(false);
  });
});

describe("createLanguageSchema", () => {
  const valid = { candidateId: 1, language: "English", proficiency: "advanced" };

  it("accepts valid input", () => {
    const r = createLanguageSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.language).toBe("English");
  });

  it("trims whitespace", () => {
    const r = createLanguageSchema.safeParse({ ...valid, language: "  Arabic  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.language).toBe("Arabic");
  });

  it("rejects missing language", () => {
    const { language: _, ...rest } = valid;
    expect(createLanguageSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing proficiency", () => {
    const { proficiency: _, ...rest } = valid;
    expect(createLanguageSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty language string", () => {
    expect(createLanguageSchema.safeParse({ ...valid, language: "" }).success).toBe(false);
  });

  it("rejects language over 128 chars", () => {
    expect(
      createLanguageSchema.safeParse({ ...valid, language: "A".repeat(129) }).success,
    ).toBe(false);
  });
});

describe("updateLanguageSchema", () => {
  const valid = { candidateId: 1, languageId: 5, language: "French", proficiency: "native" };

  it("accepts valid update", () => {
    expect(updateLanguageSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const { candidateId: _, ...rest } = valid;
    expect(updateLanguageSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing languageId", () => {
    const { languageId: _, ...rest } = valid;
    expect(updateLanguageSchema.safeParse(rest).success).toBe(false);
  });
});

describe("deleteLanguageSchema", () => {
  it("accepts valid input", () => {
    expect(deleteLanguageSchema.safeParse({ candidateId: 1, languageId: 5 }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(deleteLanguageSchema.safeParse({ languageId: 5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("languageItemSchema", () => {
  const valid = {
    candidate_language_id: 1,
    language: "English",
    proficiency: "advanced",
    candidate_language_created_at: new Date("2024-01-15"),
  };

  it("accepts a valid language item", () => {
    expect(languageItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      languageItemSchema.safeParse({ ...valid, candidate_language_created_at: null }).success,
    ).toBe(true);
  });

  it("rejects missing language", () => {
    const { language: _, ...rest } = valid;
    expect(languageItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("languageActionResultSchema", () => {
  it("accepts success with languageId", () => {
    expect(
      languageActionResultSchema.safeParse({ success: true, languageId: 1 }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      languageActionResultSchema.safeParse({ success: false, error: "Not found." }).success,
    ).toBe(true);
  });

  it("rejects success without languageId", () => {
    expect(languageActionResultSchema.safeParse({ success: true }).success).toBe(false);
  });
});

describe("languageDetailResponseSchema", () => {
  const validItem = {
    candidate_language_id: 1,
    language: "English",
    proficiency: "advanced",
    candidate_language_created_at: null,
  };

  it("accepts data response", () => {
    expect(
      languageDetailResponseSchema.safeParse({ data: validItem, error: null }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      languageDetailResponseSchema.safeParse({ data: null, error: "Not found." }).success,
    ).toBe(true);
  });

  it("rejects data and error both non-null", () => {
    expect(
      languageDetailResponseSchema.safeParse({ data: validItem, error: "Error still set" }).success,
    ).toBe(false);
  });
});
