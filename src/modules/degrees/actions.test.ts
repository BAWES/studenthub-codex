import { describe, it, expect } from "vitest";
import {
  degreeItemSchema,
  listDegreesResultSchema,
  listDegreesSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: degrees schema validation
//
// listDegrees in actions.ts uses these zod schemas internally.
// Testing them separately avoids mocking "use server" dependencies.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listDegreesSchema
// ---------------------------------------------------------------------------

describe("listDegreesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listDegreesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts name filter", () => {
    const result = listDegreesSchema.safeParse({ nameFilter: "Bachelor" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Bachelor");
    }
  });

  it("accepts degreeGroupUuid filter", () => {
    const result = listDegreesSchema.safeParse({ degreeGroupUuid: "group_uuid_123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degreeGroupUuid).toBe("group_uuid_123");
    }
  });

  it("accepts pagination params", () => {
    const result = listDegreesSchema.safeParse({
      page: "1",
      limit: "20",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    const result = listDegreesSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listDegreesSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDegreesSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects page less than 1", () => {
    const result = listDegreesSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listDegreesSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listDegreesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("degreeItemSchema", () => {
  it("accepts a valid degree item with all fields", () => {
    const result = degreeItemSchema.safeParse({
      degree_uuid: "abc-123",
      degree_group_uuid: "group-456",
      degree_name_en: "Bachelor of Science",
      degree_name_ar: null,
      degree_sort_order: 1,
      degree_created_at: new Date("2024-01-01"),
      degree_updated_at: new Date("2024-06-01"),
    });
    expect(result.success).toBe(true);
  });

  it("accepts degree item with null group and dates", () => {
    const result = degreeItemSchema.safeParse({
      degree_uuid: "abc-123",
      degree_group_uuid: null,
      degree_name_en: "Bachelor of Arts",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts Arabic name as string", () => {
    const result = degreeItemSchema.safeParse({
      degree_uuid: "abc-123",
      degree_group_uuid: null,
      degree_name_en: "Bachelor",
      degree_name_ar: "بكالوريوس",
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degree_name_ar).toBe("بكالوريوس");
    }
  });

  it("rejects missing degree_uuid", () => {
    const result = degreeItemSchema.safeParse({
      degree_group_uuid: null,
      degree_name_en: "Bachelor",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing degree_name_en", () => {
    const result = degreeItemSchema.safeParse({
      degree_uuid: "abc-123",
      degree_group_uuid: null,
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty uuid", () => {
    const result = degreeItemSchema.safeParse({
      degree_uuid: "",
      degree_group_uuid: null,
      degree_name_en: "Bachelor",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name_en", () => {
    const result = degreeItemSchema.safeParse({
      degree_uuid: "abc-123",
      degree_group_uuid: null,
      degree_name_en: "",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer sort_order", () => {
    const result = degreeItemSchema.safeParse({
      degree_uuid: "abc-123",
      degree_group_uuid: null,
      degree_name_en: "Bachelor",
      degree_name_ar: null,
      degree_sort_order: "abc",
      degree_created_at: null,
      degree_updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listDegreesResultSchema", () => {
  it("accepts a valid list result", () => {
    const result = listDegreesResultSchema.safeParse({
      degrees: [
        {
          degree_uuid: "abc-123",
          degree_group_uuid: null,
          degree_name_en: "Bachelor of Science",
          degree_name_ar: null,
          degree_sort_order: 1,
          degree_created_at: null,
          degree_updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty degree list", () => {
    const result = listDegreesResultSchema.safeParse({
      degrees: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listDegreesResultSchema.safeParse({
      degrees: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing degrees field", () => {
    const result = listDegreesResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDegreesResultSchema.safeParse({
      degrees: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listDegreesResultSchema.safeParse({
      degrees: [],
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listDegreesResultSchema.safeParse({
      degrees: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});
