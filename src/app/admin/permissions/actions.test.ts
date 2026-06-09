import { describe, it, expect } from "vitest";
import {
  getPermissionSectionSchema,
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
  listPermissionSectionsSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listPermissionSectionsSchema", () => {
  it("accepts empty params (no pagination needed — returns full tree)", () => {
    const r = listPermissionSectionsSchema.safeParse({});
    expect(r.success).toBe(true);
  });
});

describe("getPermissionSectionSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getPermissionSectionSchema.safeParse({
      permission_uuid: "per_sec1234-5678-90ab-cdef-1234567890ab",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getPermissionSectionSchema.safeParse({ permission_uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getPermissionSectionSchema.safeParse({}).success).toBe(false);
  });
});

describe("createPermissionSectionSchema", () => {
  it("accepts valid section_name", () => {
    const r = createPermissionSectionSchema.safeParse({
      section_name: "Finance Management",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.section_name).toBe("Finance Management");
    }
  });

  it("rejects empty section_name", () => {
    expect(
      createPermissionSectionSchema.safeParse({ section_name: "" }).success,
    ).toBe(false);
  });

  it("rejects missing section_name", () => {
    expect(createPermissionSectionSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string section_name", () => {
    expect(
      createPermissionSectionSchema.safeParse({ section_name: 123 }).success,
    ).toBe(false);
  });
});

describe("updatePermissionSectionSchema", () => {
  it("accepts valid UUID and section_name", () => {
    const r = updatePermissionSectionSchema.safeParse({
      permission_uuid: "per_sec1234-5678-90ab-cdef-1234567890ab",
      section_name: "Updated Section Name",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.permission_uuid).toBe(
        "per_sec1234-5678-90ab-cdef-1234567890ab",
      );
      expect(r.data.section_name).toBe("Updated Section Name");
    }
  });

  it("rejects empty UUID", () => {
    expect(
      updatePermissionSectionSchema.safeParse({
        permission_uuid: "",
        section_name: "Test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(
      updatePermissionSectionSchema.safeParse({ section_name: "Test" }).success,
    ).toBe(false);
  });

  it("rejects empty section_name", () => {
    expect(
      updatePermissionSectionSchema.safeParse({
        permission_uuid: "per_sec1234-5678-90ab-cdef-1234567890ab",
        section_name: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing section_name", () => {
    expect(
      updatePermissionSectionSchema.safeParse({
        permission_uuid: "per_sec1234-5678-90ab-cdef-1234567890ab",
      }).success,
    ).toBe(false);
  });
});
