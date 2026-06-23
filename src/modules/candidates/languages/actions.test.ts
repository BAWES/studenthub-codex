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

describe("listLanguagesSchema", () => {
  it("accepts empty params", () => {
    const r = listLanguagesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const r = listLanguagesSchema.safeParse({ candidateId: 5 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(5);
  });

  it("accepts page and limit", () => {
    const r = listLanguagesSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    expect(listLanguagesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getLanguageSchema", () => {
  it("accepts valid candidateId and languageId", () => {
    expect(getLanguageSchema.safeParse({ candidateId: 1, languageId: 5 }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getLanguageSchema.safeParse({ languageId: 5 }).success).toBe(false);
  });
});

describe("createLanguageSchema", () => {
  it("accepts valid input", () => {
    const r = createLanguageSchema.safeParse({ candidateId: 1, language: "English", proficiency: "Fluent" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.language).toBe("English");
    }
  });

  it("rejects empty language", () => {
    expect(createLanguageSchema.safeParse({ candidateId: 1, language: "", proficiency: "Basic" }).success).toBe(false);
  });

  it("rejects missing proficiency", () => {
    expect(createLanguageSchema.safeParse({ candidateId: 1, language: "Arabic" }).success).toBe(false);
  });
});

describe("updateLanguageSchema", () => {
  it("accepts valid update", () => {
    const r = updateLanguageSchema.safeParse({ candidateId: 1, languageId: 5, language: "Arabic", proficiency: "Native" });
    expect(r.success).toBe(true);
  });
});

describe("deleteLanguageSchema", () => {
  it("accepts valid input", () => {
    expect(deleteLanguageSchema.safeParse({ candidateId: 1, languageId: 5 }).success).toBe(true);
  });
});

describe("languageItemSchema", () => {
  it("accepts valid item", () => {
    const r = languageItemSchema.safeParse({
      candidate_language_id: 1,
      language: "English",
      proficiency: "Fluent",
      candidate_language_created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidate_language_id", () => {
    expect(languageItemSchema.safeParse({ language: "Test", proficiency: "Basic" }).success).toBe(false);
  });
});

describe("languageActionResultSchema", () => {
  it("accepts success", () => {
    expect(languageActionResultSchema.safeParse({ success: true, languageId: 1 }).success).toBe(true);
  });

  it("accepts error", () => {
    expect(languageActionResultSchema.safeParse({ success: false, error: "Failed" }).success).toBe(true);
  });
});

describe("languageDetailResponseSchema", () => {
  it("accepts data response", () => {
    const r = languageDetailResponseSchema.safeParse({
      data: {
        candidate_language_id: 1,
        language: "English",
        proficiency: "Fluent",
        candidate_language_created_at: null,
      },
      error: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts error response", () => {
    const r = languageDetailResponseSchema.safeParse({ data: null, error: "Not found" });
    expect(r.success).toBe(true);
  });
});
