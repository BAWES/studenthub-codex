import { describe, it, expect } from "vitest";
import {
  nationalityItemSchema,
  listNationalitiesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// nationalityItemSchema tests
// ---------------------------------------------------------------------------

describe("nationalityItemSchema", () => {
  it("should accept a valid nationality item with all fields", () => {
    const data = {
      country_id: 1,
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: "كويتي",
      country_name_en: "Kuwait",
      country_name_ar: "الكويت",
      iso: "KW",
      emoji: "🇰🇼",
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept nullable fields as null", () => {
    const data = {
      country_id: 2,
      country_nationality_name_en: "Test",
      country_nationality_name_ar: null,
      country_name_en: "Test",
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept all nullable fields as null simultaneously", () => {
    const data = {
      country_id: 3,
      country_nationality_name_en: "Stateless",
      country_nationality_name_ar: null,
      country_name_en: "Unknown",
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject missing country_id", () => {
    const data = {
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: null,
      country_name_en: "Kuwait",
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject missing country_nationality_name_en", () => {
    const data = {
      country_id: 1,
      country_nationality_name_ar: null,
      country_name_en: "Kuwait",
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject missing country_name_en", () => {
    const data = {
      country_id: 1,
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: null,
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-number country_id", () => {
    const data = {
      country_id: "one",
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: null,
      country_name_en: "Kuwait",
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-string country_nationality_name_en", () => {
    const data = {
      country_id: 1,
      country_nationality_name_en: 123,
      country_nationality_name_ar: null,
      country_name_en: "Kuwait",
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-string country_name_en", () => {
    const data = {
      country_id: 1,
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: null,
      country_name_en: true,
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-string iso when provided", () => {
    const data = {
      country_id: 1,
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: null,
      country_name_en: "Kuwait",
      country_name_ar: null,
      iso: 123,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-string emoji when provided", () => {
    const data = {
      country_id: 1,
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: null,
      country_name_en: "Kuwait",
      country_name_ar: null,
      iso: null,
      emoji: ["flag"],
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject undefined on non-nullable fields", () => {
    const data = {
      country_id: undefined,
      country_nationality_name_en: undefined,
      country_nationality_name_ar: null,
      country_name_en: undefined,
      country_name_ar: null,
      iso: null,
      emoji: null,
    };
    const result = nationalityItemSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listNationalitiesResultSchema tests
// ---------------------------------------------------------------------------

describe("listNationalitiesResultSchema", () => {
  it("should accept a valid paginated result", () => {
    const data = {
      nationalities: [
        {
          country_id: 1,
          country_nationality_name_en: "Kuwaiti",
          country_nationality_name_ar: "كويتي",
          country_name_en: "Kuwait",
          country_name_ar: "الكويت",
          iso: "KW",
          emoji: "🇰🇼",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept an empty nationalities array", () => {
    const data = {
      nationalities: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept boundary values for page and limit", () => {
    const data = {
      nationalities: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject negative total", () => {
    const data = {
      nationalities: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject zero page (must be positive)", () => {
    const data = {
      nationalities: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject limit exceeding max (100)", () => {
    const data = {
      nationalities: [],
      total: 0,
      page: 1,
      limit: 101,
      totalPages: 0,
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-array nationalities", () => {
    const data = {
      nationalities: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject missing required pagination fields", () => {
    const data = {
      nationalities: [],
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-integer total", () => {
    const data = {
      nationalities: [],
      total: 1.5,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listNationalitiesResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
