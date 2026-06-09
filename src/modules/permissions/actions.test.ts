import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  listPermissionSectionsSchema,
  getUserPermissionsSchema,
} from "./actions";
import type {
  PermissionSectionItem,
  PermissionSubSectionItem,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema validation tests for PermissionSectionController server actions
//
// Tests avoid mocking "use server" dependencies by testing Zod schemas
// and type shapes in isolation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listPermissionSectionsSchema tests
// ---------------------------------------------------------------------------

describe("listPermissionSectionsSchema", () => {
  it("accepts empty params (no pagination — returns full tree)", () => {
    const result = listPermissionSectionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getUserPermissionsSchema tests
// ---------------------------------------------------------------------------

describe("getUserPermissionsSchema", () => {
  it("accepts staff type with valid id", () => {
    const result = getUserPermissionsSchema.safeParse({
      type: "staff",
      id: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("staff");
      expect(result.data.id).toBe(42);
    }
  });

  it("accepts admin type with valid id", () => {
    const result = getUserPermissionsSchema.safeParse({
      type: "admin",
      id: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("admin");
      expect(result.data.id).toBe(1);
    }
  });

  it("rejects invalid type", () => {
    const result = getUserPermissionsSchema.safeParse({
      type: "superadmin",
      id: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = getUserPermissionsSchema.safeParse({ id: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = getUserPermissionsSchema.safeParse({ type: "staff" });
    expect(result.success).toBe(false);
  });

  it("rejects zero id", () => {
    const result = getUserPermissionsSchema.safeParse({
      type: "staff",
      id: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getUserPermissionsSchema.safeParse({
      type: "admin",
      id: -5,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string id to number", () => {
    const result = getUserPermissionsSchema.safeParse({
      type: "staff",
      id: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(15);
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("PermissionSubSectionItem type shape", () => {
  it("matches expected fields", () => {
    const item: PermissionSubSectionItem = {
      permission_sub_section_uuid: "sub_abc",
      sub_section_name: "View Users",
      sub_section_slug: "view-users",
    };
    expect(item.permission_sub_section_uuid).toBe("sub_abc");
    expect(item.sub_section_name).toBe("View Users");
    expect(item.sub_section_slug).toBe("view-users");
  });

  it("allows null sub_section_name", () => {
    const item: PermissionSubSectionItem = {
      permission_sub_section_uuid: "sub_abc",
      sub_section_name: null,
      sub_section_slug: null,
    };
    expect(item.sub_section_name).toBeNull();
    expect(item.sub_section_slug).toBeNull();
  });
});

describe("PermissionSectionItem type shape", () => {
  it("matches expected fields with sub-sections", () => {
    const item: PermissionSectionItem = {
      permission_uuid: "sec_abc",
      section_name: "Users",
      subSections: [
        {
          permission_sub_section_uuid: "sub_abc",
          sub_section_name: "View Users",
          sub_section_slug: "view-users",
        },
      ],
    };
    expect(item.section_name).toBe("Users");
    expect(item.subSections).toHaveLength(1);
    expect(item.subSections[0].sub_section_name).toBe("View Users");
  });

  it("allows empty sub-sections array", () => {
    const item: PermissionSectionItem = {
      permission_uuid: "sec_xyz",
      section_name: "Empty Section",
      subSections: [],
    };
    expect(item.subSections).toHaveLength(0);
  });
});
