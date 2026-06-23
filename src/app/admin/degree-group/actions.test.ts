import { describe, it, expect } from "vitest";
import {
  listDegreeGroupsSchema,
  createDegreeGroupSchema,
  updateDegreeGroupSchema,
  deleteDegreeGroupSchema,
  degreeGroupItemSchema,
  listDegreeGroupsResultSchema,
  degreeGroupActionResponseSchema,
} from "./schemas";
import type { DegreeGroupItem, ListDegreeGroupsResult } from "./schemas";

describe("listDegreeGroupsSchema", () => {
  it("accepts empty params", () => { const r = listDegreeGroupsSchema.safeParse({}); expect(r.success).toBe(true); if (r.success) { expect(r.data.page).toBe(1); expect(r.data.limit).toBe(50); } });
  it("accepts full filter", () => { const r = listDegreeGroupsSchema.safeParse({ page: 2, limit: 25 }); expect(r.success).toBe(true); });
  it("rejects limit over 200", () => expect(listDegreeGroupsSchema.safeParse({ limit: 999 }).success).toBe(false));
  it("rejects negative page", () => expect(listDegreeGroupsSchema.safeParse({ page: -1 }).success).toBe(false));
});

describe("createDegreeGroupSchema", () => {
  it("accepts valid input", () => { const r = createDegreeGroupSchema.safeParse({ degree_group_name_en: "Science" }); expect(r.success).toBe(true); if (r.success) expect(r.data.degree_group_name_en).toBe("Science"); });
  it("accepts input with all fields", () => { const r = createDegreeGroupSchema.safeParse({ degree_group_name_en: "Engineering", degree_group_name_ar: "الهندسة", degree_group_sort_order: 1, skip_major: 0 }); expect(r.success).toBe(true); });
  it("rejects empty name", () => expect(createDegreeGroupSchema.safeParse({ degree_group_name_en: "" }).success).toBe(false));
  it("rejects missing name", () => expect(createDegreeGroupSchema.safeParse({}).success).toBe(false));
});

describe("updateDegreeGroupSchema", () => {
  it("accepts valid update", () => expect(updateDegreeGroupSchema.safeParse({ degree_group_uuid: "abc-123", degree_group_name_en: "Updated" }).success).toBe(true));
  it("rejects missing uuid", () => expect(updateDegreeGroupSchema.safeParse({ degree_group_name_en: "Updated" }).success).toBe(false));
  it("rejects empty name", () => expect(updateDegreeGroupSchema.safeParse({ degree_group_uuid: "abc", degree_group_name_en: "" }).success).toBe(false));
});

describe("deleteDegreeGroupSchema", () => {
  it("accepts valid uuid", () => expect(deleteDegreeGroupSchema.safeParse({ degree_group_uuid: "abc-123" }).success).toBe(true));
  it("rejects missing uuid", () => expect(deleteDegreeGroupSchema.safeParse({}).success).toBe(false));
});

describe("DegreeGroupItem type", () => {
  it("has required shape", () => {
    const i: DegreeGroupItem = {
      degree_group_uuid: "abc-123",
      degree_group_name_en: "Science",
      degree_group_name_ar: null,
      degree_group_sort_order: null,
      skip_major: null,
      degree_group_created_at: new Date(),
      degree_group_updated_at: null,
    };
    expect(i.degree_group_uuid).toBe("abc-123");
  });
  it("accepts null optional fields", () => {
    const i: DegreeGroupItem = {
      degree_group_uuid: "abc",
      degree_group_name_en: "Arts",
      degree_group_name_ar: null,
      degree_group_sort_order: null,
      skip_major: null,
      degree_group_created_at: null,
      degree_group_updated_at: null,
    };
    expect(i.degree_group_name_ar).toBeNull();
  });
});

describe("ListDegreeGroupsResult", () => {
  it("has correct shape", () => {
    const r: ListDegreeGroupsResult = { degree_groups: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    expect(r.degree_groups).toHaveLength(0);
    expect(r.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Output validation — degreeGroupItemSchema
// ---------------------------------------------------------------------------

describe("degreeGroupItemSchema (output validation)", () => {
  it("accepts a valid item", () => {
    const r = degreeGroupItemSchema.safeParse({
      degree_group_uuid: "abc-123",
      degree_group_name_en: "Science",
      degree_group_name_ar: null,
      degree_group_sort_order: 1,
      skip_major: 0,
      degree_group_created_at: new Date("2026-01-01"),
      degree_group_updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts item with all nulls", () => {
    const r = degreeGroupItemSchema.safeParse({
      degree_group_uuid: "abc",
      degree_group_name_en: "Arts",
      degree_group_name_ar: null,
      degree_group_sort_order: null,
      skip_major: null,
      degree_group_created_at: null,
      degree_group_updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(
      degreeGroupItemSchema.safeParse({
        degree_group_name_en: "Science",
        degree_group_name_ar: null,
        degree_group_sort_order: null,
        skip_major: null,
        degree_group_created_at: null,
        degree_group_updated_at: null,
      }).success,
    ).toBe(false);
  });

  it("rejects empty name_en", () => {
    expect(
      degreeGroupItemSchema.safeParse({
        degree_group_uuid: "abc",
        degree_group_name_en: "",
        degree_group_name_ar: null,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — listDegreeGroupsResultSchema
// ---------------------------------------------------------------------------

describe("listDegreeGroupsResultSchema (output validation)", () => {
  const validResponse = {
    degree_groups: [
      { degree_group_uuid: "abc", degree_group_name_en: "Science", degree_group_name_ar: null, degree_group_sort_order: null, skip_major: null, degree_group_created_at: new Date(), degree_group_updated_at: null },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid response", () => {
    const r = listDegreeGroupsResultSchema.safeParse(validResponse);
    expect(r.success).toBe(true);
  });

  it("accepts empty array", () => {
    const r = listDegreeGroupsResultSchema.safeParse({
      ...validResponse,
      degree_groups: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    expect(
      listDegreeGroupsResultSchema.safeParse({
        degree_groups: [],
        page: 1,
        limit: 50,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listDegreeGroupsResultSchema.safeParse({
        ...validResponse,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — degreeGroupActionResponseSchema
// ---------------------------------------------------------------------------

describe("degreeGroupActionResponseSchema (output validation)", () => {
  it("accepts success response", () => {
    const r = degreeGroupActionResponseSchema.safeParse({
      operation: "success",
      message: "Degree group created successfully",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error response", () => {
    const r = degreeGroupActionResponseSchema.safeParse({
      operation: "error",
      message: "Degree group not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(degreeGroupActionResponseSchema.safeParse({ message: "Msg" }).success).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(degreeGroupActionResponseSchema.safeParse({ operation: "", message: "Msg" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(degreeGroupActionResponseSchema.safeParse({ operation: "success", message: "" }).success).toBe(false);
  });
});
