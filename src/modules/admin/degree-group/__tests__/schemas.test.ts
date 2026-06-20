import { describe, it, expect } from "vitest";
import {
  degreeGroupListItemSchema,
  degreeGroupDetailSchema,
  createDegreeGroupInputSchema,
  updateDegreeGroupInputSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: degree-group schema validation
//
// All admin actions in actions.ts should validate data through these schemas.
// Testing them separately avoids mocking "use server" dependencies (prisma,
// session, next/cache).
// ---------------------------------------------------------------------------

const validListItem = {
  id: "b3e1c2a4-5d6f-7a8b-9c0d-1e2f3a4b5c6d",
  name_en: "Bachelor's",
  name_ar: "بكالوريوس",
  sort_order: 1,
  skip_major: 0,
  degree_count: 5,
  created: "Jun 15, 2026",
  updated: "Jun 20, 2026",
};

const validDetail = {
  degree_group_uuid: "b3e1c2a4-5d6f-7a8b-9c0d-1e2f3a4b5c6d",
  degree_group_name_en: "Bachelor's",
  degree_group_name_ar: "بكالوريوس",
  degree_group_sort_order: 1,
  skip_major: 0,
  degree_group_created_at: new Date("2026-01-15"),
  degree_group_updated_at: new Date("2026-06-20"),
};

describe("degreeGroupListItemSchema", () => {
  it("accepts a valid list item with all fields", () => {
    const result = degreeGroupListItemSchema.safeParse(validListItem);
    expect(result.success).toBe(true);
  });

  it("accepts a minimal list item (nulls for optional strings)", () => {
    const minimal = {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      name_en: "Master's",
      name_ar: null,
      sort_order: 0,
      skip_major: 0,
      degree_count: 0,
      created: "-",
      updated: "-",
    };
    const result = degreeGroupListItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing required id", () => {
    const result = degreeGroupListItemSchema.safeParse({
      name_en: "Bachelor's",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required name_en", () => {
    const result = degreeGroupListItemSchema.safeParse({
      id: "b3e1c2a4-5d6f-7a8b-9c0d-1e2f3a4b5c6d",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer sort_order", () => {
    const result = degreeGroupListItemSchema.safeParse({
      ...validListItem,
      sort_order: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer skip_major", () => {
    const result = degreeGroupListItemSchema.safeParse({
      ...validListItem,
      skip_major: "yes",
    });
    expect(result.success).toBe(false);
  });
});

describe("degreeGroupDetailSchema", () => {
  it("accepts a valid detail object", () => {
    const result = degreeGroupDetailSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("accepts null for optional fields", () => {
    const result = degreeGroupDetailSchema.safeParse({
      degree_group_uuid: "b3e1c2a4-5d6f-7a8b-9c0d-1e2f3a4b5c6d",
      degree_group_name_en: "Bachelor's",
      degree_group_name_ar: null,
      degree_group_sort_order: null,
      skip_major: null,
      degree_group_created_at: null,
      degree_group_updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required uuid", () => {
    const result = degreeGroupDetailSchema.safeParse({
      degree_group_name_en: "Bachelor's",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid string in degree_group_uuid", () => {
    const result = degreeGroupDetailSchema.safeParse({
      ...validDetail,
      degree_group_uuid: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("createDegreeGroupInputSchema", () => {
  it("accepts valid input with only required fields", () => {
    const result = createDegreeGroupInputSchema.safeParse({
      degree_group_name_en: "Diploma",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    const result = createDegreeGroupInputSchema.safeParse({
      degree_group_name_en: "Diploma",
      degree_group_name_ar: "دبلوم",
      degree_group_sort_order: 3,
      skip_major: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required name_en", () => {
    const result = createDegreeGroupInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name_en", () => {
    const result = createDegreeGroupInputSchema.safeParse({
      degree_group_name_en: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateDegreeGroupInputSchema", () => {
  it("accepts valid update payload", () => {
    const result = updateDegreeGroupInputSchema.safeParse({
      degree_group_name_en: "Bachelor's Updated",
      degree_group_name_ar: "بكالوريوس محدث",
      degree_group_sort_order: 2,
      skip_major: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with only one field", () => {
    const result = updateDegreeGroupInputSchema.safeParse({
      degree_group_name_en: "Renamed Only",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sort_order type", () => {
    const result = updateDegreeGroupInputSchema.safeParse({
      degree_group_name_en: "Test",
      degree_group_sort_order: "not-a-number",
    });
    expect(result.success).toBe(false);
  });
});
