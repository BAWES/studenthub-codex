import { describe, it, expect } from "vitest";
import {
  listMajorsSchema,
  createMajorSchema,
  updateMajorSchema,
  deleteMajorSchema,
  majorItemSchema,
  listMajorsResultSchema,
  majorActionResponseSchema,
} from "./schemas";
import type { MajorItem, ListMajorsResult } from "./schemas";

describe("listMajorsSchema", () => {
  it("accepts empty params", () => {
    const r = listMajorsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts full filter", () => {
    const r = listMajorsSchema.safeParse({ page: 2, limit: 25 });
    expect(r.success).toBe(true);
  });

  it("rejects limit over 200", () =>
    expect(listMajorsSchema.safeParse({ limit: 999 }).success).toBe(false));

  it("rejects negative page", () =>
    expect(listMajorsSchema.safeParse({ page: -1 }).success).toBe(false));
});

describe("createMajorSchema", () => {
  it("accepts valid input", () => {
    const r = createMajorSchema.safeParse({
      major_name_en: "Computer Science",
      major_name_ar: "علوم الحاسوب",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.major_name_en).toBe("Computer Science");
      expect(r.data.major_name_ar).toBe("علوم الحاسوب");
    }
  });

  it("rejects empty english name", () =>
    expect(
      createMajorSchema.safeParse({ major_name_en: "", major_name_ar: "ar" })
        .success,
    ).toBe(false));

  it("rejects empty arabic name", () =>
    expect(
      createMajorSchema.safeParse({ major_name_en: "en", major_name_ar: "" })
        .success,
    ).toBe(false));

  it("rejects missing fields", () =>
    expect(createMajorSchema.safeParse({}).success).toBe(false));
});

describe("updateMajorSchema", () => {
  it("accepts valid update", () =>
    expect(
      updateMajorSchema.safeParse({
        major_uuid: "abc",
        major_name_en: "Updated",
        major_name_ar: "محدث",
      }).success,
    ).toBe(true));

  it("rejects missing major_uuid", () =>
    expect(
      updateMajorSchema.safeParse({ major_name_en: "En", major_name_ar: "Ar" })
        .success,
    ).toBe(false));

  it("rejects empty name", () =>
    expect(
      updateMajorSchema.safeParse({
        major_uuid: "abc",
        major_name_en: "",
        major_name_ar: "Ar",
      }).success,
    ).toBe(false));
});

describe("deleteMajorSchema", () => {
  it("accepts valid uuid", () =>
    expect(deleteMajorSchema.safeParse({ major_uuid: "abc" }).success).toBe(
      true,
    ));

  it("rejects missing uuid", () =>
    expect(deleteMajorSchema.safeParse({}).success).toBe(false));
});

describe("MajorItem type", () => {
  it("has required shape", () => {
    const i: MajorItem = {
      major_uuid: "abc",
      major_name_en: "CS",
      major_name_ar: "cs",
      data_source: null,
      major_created_at: new Date(),
      major_updated_at: null,
    };
    expect(i.major_uuid).toBe("abc");
    expect(i.major_name_en).toBe("CS");
  });

  it("accepts null dates", () => {
    const i: MajorItem = {
      major_uuid: "abc",
      major_name_en: "Math",
      major_name_ar: "رياضيات",
      data_source: null,
      major_created_at: null,
      major_updated_at: null,
    };
    expect(i.major_created_at).toBeNull();
  });
});

describe("ListMajorsResult", () => {
  it("has correct shape", () => {
    const r: ListMajorsResult = {
      majors: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(r.majors).toHaveLength(0);
    expect(r.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Output validation — majorItemSchema
// ---------------------------------------------------------------------------

describe("majorItemSchema (output validation)", () => {
  it("accepts a valid major item", () => {
    const r = majorItemSchema.safeParse({
      major_uuid: "abc",
      major_name_en: "Computer Science",
      major_name_ar: "علوم الحاسوب",
      data_source: null,
      major_created_at: new Date("2026-01-01"),
      major_updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts major with both dates null", () => {
    const r = majorItemSchema.safeParse({
      major_uuid: "abc",
      major_name_en: "Math",
      major_name_ar: "رياضيات",
      data_source: 1,
      major_created_at: null,
      major_updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing major_uuid", () => {
    expect(
      majorItemSchema.safeParse({
        major_name_en: "CS",
        major_name_ar: "cs",
        data_source: null,
        major_created_at: null,
        major_updated_at: null,
      }).success,
    ).toBe(false);
  });

  it("rejects empty major_name_en", () => {
    expect(
      majorItemSchema.safeParse({
        major_uuid: "abc",
        major_name_en: "",
        major_name_ar: "cs",
        data_source: null,
        major_created_at: null,
        major_updated_at: null,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — listMajorsResultSchema
// ---------------------------------------------------------------------------

describe("listMajorsResultSchema (output validation)", () => {
  const validResponse = {
    majors: [
      {
        major_uuid: "abc",
        major_name_en: "CS",
        major_name_ar: "cs",
        data_source: null,
        major_created_at: new Date(),
        major_updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid list majors response", () => {
    const r = listMajorsResultSchema.safeParse(validResponse);
    expect(r.success).toBe(true);
  });

  it("accepts empty majors array", () => {
    const r = listMajorsResultSchema.safeParse({
      ...validResponse,
      majors: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    expect(
      listMajorsResultSchema.safeParse({
        majors: [],
        page: 1,
        limit: 50,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listMajorsResultSchema.safeParse({
        ...validResponse,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — majorActionResponseSchema
// ---------------------------------------------------------------------------

describe("majorActionResponseSchema (output validation)", () => {
  it("accepts success response", () => {
    const r = majorActionResponseSchema.safeParse({
      operation: "success",
      message: "Major created successfully",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error response", () => {
    const r = majorActionResponseSchema.safeParse({
      operation: "error",
      message: "Major not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      majorActionResponseSchema.safeParse({ message: "Msg" }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      majorActionResponseSchema.safeParse({ operation: "success", message: "" })
        .success,
    ).toBe(false);
  });
});
