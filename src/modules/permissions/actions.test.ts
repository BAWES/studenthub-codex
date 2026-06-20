import { describe, it, expect } from "vitest";
import {
  listPermissionSectionsSchema,
  getUserPermissionsSchema,
  permissionSubSectionItemSchema,
  permissionSectionItemSchema,
  permissionSectionListResponseSchema,
  permissionUserItemSchema,
  permissionUserListResponseSchema,
} from "./schemas";
import type {
  PermissionSectionItem,
  PermissionSubSectionItem,
  PermissionUserItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests for PermissionSectionController server actions
//
// Tests avoid mocking "use server" dependencies by testing Zod schemas
// and type shapes in isolation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listPermissionSectionsSchema", () => {
  it("accepts empty params (no pagination — returns full tree)", () => {
    const result = listPermissionSectionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

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
// Output schema tests — permissionSubSectionItemSchema
// ---------------------------------------------------------------------------

describe("permissionSubSectionItemSchema", () => {
  it("accepts a valid sub-section item", () => {
    const result = permissionSubSectionItemSchema.safeParse({
      permission_sub_section_uuid: "sub_abc",
      sub_section_name: "View Users",
      sub_section_slug: "view-users",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null sub_section_name and slug", () => {
    const result = permissionSubSectionItemSchema.safeParse({
      permission_sub_section_uuid: "sub_abc",
      sub_section_name: null,
      sub_section_slug: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing permission_sub_section_uuid", () => {
    const result = permissionSubSectionItemSchema.safeParse({
      sub_section_name: "View Users",
      sub_section_slug: "view-users",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string permission_sub_section_uuid", () => {
    const result = permissionSubSectionItemSchema.safeParse({
      permission_sub_section_uuid: 123,
      sub_section_name: null,
      sub_section_slug: null,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — permissionSectionItemSchema
// ---------------------------------------------------------------------------

describe("permissionSectionItemSchema", () => {
  it("accepts a valid section item with sub-sections", () => {
    const result = permissionSectionItemSchema.safeParse({
      permission_uuid: "sec_abc",
      section_name: "Users",
      subSections: [
        {
          permission_sub_section_uuid: "sub_abc",
          sub_section_name: "View Users",
          sub_section_slug: "view-users",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty sub-sections array", () => {
    const result = permissionSectionItemSchema.safeParse({
      permission_uuid: "sec_xyz",
      section_name: "Empty Section",
      subSections: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts null section_name", () => {
    const result = permissionSectionItemSchema.safeParse({
      permission_uuid: "sec_abc",
      section_name: null,
      subSections: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    const result = permissionSectionItemSchema.safeParse({
      section_name: "Users",
      subSections: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing subSections field", () => {
    const result = permissionSectionItemSchema.safeParse({
      permission_uuid: "sec_abc",
      section_name: "Users",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — permissionSectionListResponseSchema
// ---------------------------------------------------------------------------

describe("permissionSectionListResponseSchema", () => {
  it("accepts a valid array of section items", () => {
    const result = permissionSectionListResponseSchema.safeParse([
      {
        permission_uuid: "sec_1",
        section_name: "Users",
        subSections: [
          {
            permission_sub_section_uuid: "sub_1",
            sub_section_name: "View",
            sub_section_slug: "view",
          },
        ],
      },
      {
        permission_uuid: "sec_2",
        section_name: "Roles",
        subSections: [],
      },
    ]);
    expect(result.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const result = permissionSectionListResponseSchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it("rejects non-array", () => {
    const result = permissionSectionListResponseSchema.safeParse({
      permission_uuid: "sec_1",
      section_name: "Users",
      subSections: [],
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — permissionUserItemSchema
// ---------------------------------------------------------------------------

describe("permissionUserItemSchema", () => {
  it("accepts a valid user permission item", () => {
    const result = permissionUserItemSchema.safeParse({
      permission_user_uuid: "pu_abc",
      admin_id: 1,
      staff_id: null,
      permission_sub_section_uuid: "sub_abc",
      sub_section_name: "View Users",
      sub_section_slug: "view-users",
      section_name: "Users",
      companies: ["comp_a", "comp_b"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts null admin_id and staff_id", () => {
    const result = permissionUserItemSchema.safeParse({
      permission_user_uuid: "pu_abc",
      admin_id: null,
      staff_id: null,
      permission_sub_section_uuid: null,
      sub_section_name: null,
      sub_section_slug: null,
      section_name: null,
      companies: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing permission_user_uuid", () => {
    const result = permissionUserItemSchema.safeParse({
      admin_id: null,
      staff_id: null,
      permission_sub_section_uuid: null,
      sub_section_name: null,
      sub_section_slug: null,
      section_name: null,
      companies: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-array companies", () => {
    const result = permissionUserItemSchema.safeParse({
      permission_user_uuid: "pu_abc",
      admin_id: null,
      staff_id: null,
      permission_sub_section_uuid: null,
      sub_section_name: null,
      sub_section_slug: null,
      section_name: null,
      companies: "not-an-array",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — permissionUserListResponseSchema
// ---------------------------------------------------------------------------

describe("permissionUserListResponseSchema", () => {
  it("accepts an array of user permission items", () => {
    const result = permissionUserListResponseSchema.safeParse([
      {
        permission_user_uuid: "pu_1",
        admin_id: 1,
        staff_id: null,
        permission_sub_section_uuid: "sub_1",
        sub_section_name: "View",
        sub_section_slug: "view",
        section_name: "Users",
        companies: [],
      },
    ]);
    expect(result.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const result = permissionUserListResponseSchema.safeParse([]);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (compile-time validation via runtime usage)
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

describe("PermissionUserItem type shape", () => {
  it("matches expected fields", () => {
    const item: PermissionUserItem = {
      permission_user_uuid: "pu_abc",
      admin_id: 1,
      staff_id: null,
      permission_sub_section_uuid: "sub_abc",
      sub_section_name: "View Users",
      sub_section_slug: "view-users",
      section_name: "Users",
      companies: ["comp_a"],
    };
    expect(item.permission_user_uuid).toBe("pu_abc");
    expect(item.companies).toHaveLength(1);
  });
});
