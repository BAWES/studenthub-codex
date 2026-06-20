import { describe, it, expect } from "vitest";
import {
  createDegreeSchema,
  updateDegreeSchema,
  deleteDegreeSchema,
  degreeItemSchema,
  listDegreesResultSchema,
  degreeActionResponseSchema,
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
// CRUD Schema Validation Tests
// ---------------------------------------------------------------------------

describe("createDegreeSchema", () => {
  it("accepts valid input with just english name", () => {
    const r = createDegreeSchema.safeParse({ degree_name_en: "Bachelor of Science" });
    expect(r.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const r = createDegreeSchema.safeParse({
      degree_name_en: "Master of Arts",
      degree_name_ar: "ماجستير في الآداب",
      degree_group_uuid: "group-123",
      degree_sort_order: 2,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.degree_sort_order).toBe(2);
    }
  });

  it("rejects empty english name", () => {
    const r = createDegreeSchema.safeParse({ degree_name_en: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing english name", () => {
    const r = createDegreeSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("coerces string sort_order to number", () => {
    const r = createDegreeSchema.safeParse({
      degree_name_en: "PhD",
      degree_sort_order: "3",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.degree_sort_order).toBe(3);
    }
  });
});

describe("updateDegreeSchema", () => {
  it("accepts valid update input", () => {
    const r = updateDegreeSchema.safeParse({
      degree_uuid: "deg-001",
      degree_name_en: "Bachelor of Science",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable optional fields", () => {
    const r = updateDegreeSchema.safeParse({
      degree_uuid: "deg-001",
      degree_name_en: "Updated Name",
      degree_name_ar: null,
      degree_group_uuid: null,
      degree_sort_order: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const r = updateDegreeSchema.safeParse({
      degree_name_en: "Name Only",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty english name", () => {
    const r = updateDegreeSchema.safeParse({
      degree_uuid: "deg-001",
      degree_name_en: "",
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteDegreeSchema", () => {
  it("accepts valid uuid", () => {
    const r = deleteDegreeSchema.safeParse({ degree_uuid: "deg-001" });
    expect(r.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const r = deleteDegreeSchema.safeParse({ degree_uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const r = deleteDegreeSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
