import { describe, it, expect } from "vitest";
import { getDegreeSchema, getDegreeResultSchema, degreeDetailItemSchema } from "./schemas";

describe("getDegreeSchema", () => {
  it("accepts a valid degree UUID", () => {
    const result = getDegreeSchema.safeParse({ degreeUuid: "deg-001" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degreeUuid).toBe("deg-001");
    }
  });

  it("rejects empty degree UUID", () => {
    const result = getDegreeSchema.safeParse({ degreeUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing degreeUuid", () => {
    const result = getDegreeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("degreeDetailItemSchema", () => {
  const validItem = {
    degree_uuid: "deg-001",
    degree_group_uuid: null,
    degree_name_en: "Bachelor of Science",
    degree_name_ar: null,
    degree_sort_order: 1,
    degree_created_at: new Date("2026-01-01"),
    degree_updated_at: null,
    degree_group: null,
  };

  it("accepts a valid detail item with degree_group null", () => {
    expect(degreeDetailItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts a detail item with populated degree_group", () => {
    const item = {
      ...validItem,
      degree_group: {
        degree_group_uuid: "group-1",
        degree_group_name_en: "Bachelor Degrees",
      },
    };
    expect(degreeDetailItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects missing degree_uuid", () => {
    const { degree_uuid: _, ...rest } = validItem;
    expect(degreeDetailItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("getDegreeResultSchema", () => {
  it("accepts a valid degree result with null degree_group", () => {
    const result = getDegreeResultSchema.safeParse({
      degree: {
        degree_uuid: "deg-001",
        degree_group_uuid: null,
        degree_name_en: "Bachelor of Science",
        degree_name_ar: null,
        degree_sort_order: 1,
        degree_created_at: new Date("2026-01-01"),
        degree_updated_at: null,
        degree_group: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid degree result with degree_group", () => {
    const result = getDegreeResultSchema.safeParse({
      degree: {
        degree_uuid: "deg-001",
        degree_group_uuid: "group-1",
        degree_name_en: "Bachelor of Science",
        degree_name_ar: null,
        degree_sort_order: 1,
        degree_created_at: new Date("2026-01-01"),
        degree_updated_at: null,
        degree_group: {
          degree_group_uuid: "group-1",
          degree_group_name_en: "Bachelor Degrees",
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts null degree (not found)", () => {
    const result = getDegreeResultSchema.safeParse({ degree: null });
    expect(result.success).toBe(true);
  });
});
