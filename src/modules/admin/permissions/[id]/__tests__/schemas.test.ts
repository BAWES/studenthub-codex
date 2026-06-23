import { describe, it, expect } from "vitest";
import {
  getPermissionSectionSchema,
  permissionSectionSchema,
  getPermissionSectionResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Input schema: getPermissionSectionSchema
// ---------------------------------------------------------------------------
describe("getPermissionSectionSchema", () => {
  it("accepts a valid permission section UUID", () => {
    const result = getPermissionSectionSchema.safeParse({
      permissionUuid: "per_sec1234-5678-90ab-cdef-1234567890ab",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.permissionUuid).toBe(
        "per_sec1234-5678-90ab-cdef-1234567890ab",
      );
    }
  });

  it("rejects empty UUID", () => {
    const result = getPermissionSectionSchema.safeParse({
      permissionUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing permissionUuid", () => {
    const result = getPermissionSectionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: permissionSectionSchema
// ---------------------------------------------------------------------------
describe("permissionSectionSchema", () => {
  const validSection = {
    permission_uuid: "per_sec_001",
    section_name: "Finance Management",
    created_at: new Date("2024-01-01"),
  };

  it("accepts a valid permission section", () => {
    expect(permissionSectionSchema.safeParse(validSection).success).toBe(true);
  });

  it("accepts null section_name", () => {
    expect(
      permissionSectionSchema.safeParse({
        ...validSection,
        section_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    const { permission_uuid: _, ...rest } = validSection;
    expect(permissionSectionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing created_at", () => {
    const { created_at: _, ...rest } = validSection;
    expect(permissionSectionSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string instead of Date for created_at", () => {
    expect(
      permissionSectionSchema.safeParse({
        ...validSection,
        created_at: "2024-01-01",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: getPermissionSectionResultSchema
// ---------------------------------------------------------------------------
describe("getPermissionSectionResultSchema", () => {
  const validSection = {
    permission_uuid: "per_sec_001",
    section_name: "Finance Management",
    created_at: new Date("2024-01-01"),
  };

  it("accepts a valid permission section result", () => {
    const result = getPermissionSectionResultSchema.safeParse(validSection);
    expect(result.success).toBe(true);
  });

  it("accepts null (not found)", () => {
    const result = getPermissionSectionResultSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("rejects invalid section data", () => {
    expect(
      getPermissionSectionResultSchema.safeParse({
        permission_uuid: "",
        section_name: "Test",
      }).success,
    ).toBe(false);
  });
});
