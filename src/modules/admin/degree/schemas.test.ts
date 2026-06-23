import { describe, it, expect } from "vitest";
import {
  degreeItemSchema,
  listDegreesResultSchema,
  degreeActionResponseSchema,
  degreeListItemSchema,
  listDegreeResultSchema,
  degreeIdResultSchema,
  createDegreeSchema,
} from "./schemas";

describe("degreeItemSchema", () => {
  const validItem = {
    degree_uuid: "deg-001",
    degree_group_uuid: null,
    degree_name_en: "Bachelor of Science",
    degree_name_ar: null,
    degree_sort_order: 1,
    degree_created_at: new Date("2026-01-01"),
    degree_updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid degree item", () => {
    expect(degreeItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      degreeItemSchema.safeParse({
        ...validItem,
        degree_group_uuid: null,
        degree_name_ar: null,
        degree_sort_order: null,
        degree_created_at: null,
        degree_updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing degree_uuid", () => {
    const { degree_uuid: _, ...rest } = validItem;
    expect(degreeItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty degree_name_en", () => {
    expect(
      degreeItemSchema.safeParse({ ...validItem, degree_name_en: "" }).success,
    ).toBe(false);
  });

  it("rejects missing degree_name_en", () => {
    const { degree_name_en: _, ...rest } = validItem;
    expect(degreeItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listDegreesResultSchema", () => {
  const validResult = {
    degrees: [
      {
        degree_uuid: "deg-001",
        degree_group_uuid: null,
        degree_name_en: "Bachelor of Science",
        degree_name_ar: null,
        degree_sort_order: 1,
        degree_created_at: new Date("2026-01-01"),
        degree_updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid list degrees result", () => {
    expect(listDegreesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty degrees array", () => {
    expect(
      listDegreesResultSchema.safeParse({
        ...validResult,
        degrees: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing degrees", () => {
    const { degrees: _, ...rest } = validResult;
    expect(listDegreesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listDegreesResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });
});

describe("degreeActionResponseSchema", () => {
  it("accepts a valid action response", () => {
    expect(
      degreeActionResponseSchema.safeParse({
        operation: "success",
        message: "Degree updated",
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      degreeActionResponseSchema.safeParse({ message: "Done" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// New inline CRUD schemas
// ---------------------------------------------------------------------------

describe("degreeListItemSchema", () => {
  it("accepts a valid degree list item", () => {
    const result = degreeListItemSchema.safeParse({
      degree_uuid: "deg-001",
      degree_name_en: "Bachelor",
      degree_name_ar: null,
      degree_sort_order: 1,
      degree_group_uuid: "group-1",
      group_name_en: "Undergraduate",
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const result = degreeListItemSchema.safeParse({
      degree_uuid: "deg-002",
      degree_name_en: "Master",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_group_uuid: null,
      group_name_en: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing degree_uuid", () => {
    const result = degreeListItemSchema.safeParse({
      degree_name_en: "Test",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_group_uuid: null,
      group_name_en: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listDegreeResultSchema", () => {
  it("accepts a valid result with records", () => {
    const result = listDegreeResultSchema.safeParse({
      records: [
        {
          degree_uuid: "deg-001",
          degree_name_en: "Bachelor",
          degree_name_ar: null,
          degree_sort_order: 1,
          degree_group_uuid: null,
          group_name_en: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty records", () => {
    const result = listDegreeResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-array records", () => {
    const result = listDegreeResultSchema.safeParse({
      records: "not-an-array",
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("degreeIdResultSchema", () => {
  it("accepts a valid UUID", () => {
    const result = degreeIdResultSchema.safeParse({
      degree_uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID string", () => {
    const result = degreeIdResultSchema.safeParse({
      degree_uuid: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing degree_uuid", () => {
    const result = degreeIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createDegreeSchema", () => {
  it("accepts valid degree creation input", () => {
    const result = createDegreeSchema.safeParse({
      degree_name_en: "Bachelor of Science",
      degree_name_ar: "بكالوريوس علوم",
      degree_sort_order: 1,
      degree_group_uuid: "group-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal input (name only)", () => {
    const result = createDegreeSchema.safeParse({
      degree_name_en: "Bachelor",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty english name", () => {
    const result = createDegreeSchema.safeParse({
      degree_name_en: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too long english name", () => {
    const result = createDegreeSchema.safeParse({
      degree_name_en: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("coerces string sort_order to number", () => {
    const result = createDegreeSchema.safeParse({
      degree_name_en: "Test",
      degree_sort_order: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degree_sort_order).toBe(3);
    }
  });
});
