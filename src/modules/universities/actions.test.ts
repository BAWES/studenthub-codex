import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: university schema validation
//
// listUniversities and createUniversity in actions.ts use these zod schemas
// internally. Testing them separately avoids the need to mock "use server"
// dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listUniversitiesSchema = z.object({
  q: z.string().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(500).optional().default(200),
});

const createUniversitySchema = z.object({
  name: z.string().min(1, "University name is required").max(100),
});

describe("listUniversities schema", () => {
  it("accepts empty params with defaults", () => {
    const result = listUniversitiesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("");
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(200);
    }
  });

  it("accepts a search query", () => {
    const result = listUniversitiesSchema.safeParse({ q: "Kuwait" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("Kuwait");
    }
  });

  it("accepts numeric strings for page and limit", () => {
    const result = listUniversitiesSchema.safeParse({
      page: "3",
      limit: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects page = 0", () => {
    const result = listUniversitiesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listUniversitiesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 500", () => {
    const result = listUniversitiesSchema.safeParse({ limit: 501 });
    expect(result.success).toBe(false);
  });

  it("parses numeric page and limit", () => {
    const result = listUniversitiesSchema.safeParse({
      page: 2,
      limit: 100,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(100);
    }
  });
});

describe("createUniversity schema", () => {
  it("accepts valid university name", () => {
    const result = createUniversitySchema.safeParse({
      name: "Kuwait University",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Kuwait University");
    }
  });

  it("rejects empty name", () => {
    const result = createUniversitySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe(
      "University name is required",
    );
  });

  it("rejects name longer than 100 characters", () => {
    const result = createUniversitySchema.safeParse({
      name: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name field entirely", () => {
    const result = createUniversitySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts name with Arabic characters", () => {
    const result = createUniversitySchema.safeParse({
      name: "جامعة الكويت",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("جامعة الكويت");
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema tests (from ./schemas.ts)
// ---------------------------------------------------------------------------

import {
  universityItemSchema,
  listUniversitiesResultSchema,
  createUniversityResultSchema,
  type UniversityItem,
  type ListUniversitiesResult,
  type CreateUniversityResult,
} from "./schemas";

describe("universityItemSchema (output)", () => {
  it("validates a complete university item", () => {
    const mock: UniversityItem = {
      university_id: 1,
      university_name_en: "Kuwait University",
      university_name_ar: "جامعة الكويت",
    };
    const parsed = universityItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.university_id).toBe(1);
      expect(parsed.data.university_name_en).toBe("Kuwait University");
    }
  });

  it("allows null names", () => {
    const mock: UniversityItem = {
      university_id: 2,
      university_name_en: null,
      university_name_ar: null,
    };
    const parsed = universityItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing university_id", () => {
    const parsed = universityItemSchema.safeParse({
      university_name_en: "Test",
      university_name_ar: null,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects negative university_id", () => {
    const parsed = universityItemSchema.safeParse({
      university_id: -1,
      university_name_en: "Test",
      university_name_ar: null,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("listUniversitiesResultSchema (output)", () => {
  it("validates a complete list result", () => {
    const mock: ListUniversitiesResult = {
      universities: [
        {
          university_id: 1,
          university_name_en: "Kuwait University",
          university_name_ar: "جامعة الكويت",
        },
      ],
      total: 1,
      page: 1,
      limit: 200,
    };
    const parsed = listUniversitiesResultSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.universities).toHaveLength(1);
      expect(parsed.data.total).toBe(1);
    }
  });

  it("validates empty universities array", () => {
    const mock: ListUniversitiesResult = {
      universities: [],
      total: 0,
      page: 1,
      limit: 200,
    };
    const parsed = listUniversitiesResultSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
  });

  it("rejects negative total", () => {
    const parsed = listUniversitiesResultSchema.safeParse({
      universities: [],
      total: -1,
      page: 1,
      limit: 200,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("createUniversityResultSchema (output)", () => {
  it("validates success result", () => {
    const mock: CreateUniversityResult = {
      operation: "success",
      message: "University created successfully",
      university: {
        university_id: 1,
        university_name_en: "Kuwait University",
        university_name_ar: "جامعة الكويت",
      },
    };
    const parsed = createUniversityResultSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.operation).toBe("success");
    }
  });

  it("validates error result", () => {
    const mock: CreateUniversityResult = {
      operation: "error",
      message: "University already exists",
    };
    const parsed = createUniversityResultSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.operation).toBe("error");
      expect(parsed.data.message).toBe("University already exists");
    }
  });

  it("rejects unknown operation", () => {
    const parsed = createUniversityResultSchema.safeParse({
      operation: "invalid",
      message: "test",
    });
    expect(parsed.success).toBe(false);
  });
});
