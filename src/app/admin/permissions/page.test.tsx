import { describe, it, expect } from "vitest";
import {
  listPermissionSectionsSchema,
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
  listPermissionSectionsOutputSchema,
  createPermissionSectionOutputSchema,
  updatePermissionSectionOutputSchema,
} from "./schemas";

/**
 * Page migration test for admin/permissions.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin permissions page — data contract", () => {
  it("listPermissionSectionsSchema parses with defaults (empty object)", () => {
    const r = listPermissionSectionsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("createPermissionSectionSchema validates with section_name", () => {
    const r = createPermissionSectionSchema.safeParse({
      section_name: "User Management",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.section_name).toBe("User Management");
    }
  });

  it("createPermissionSectionSchema rejects missing section_name", () => {
    const r = createPermissionSectionSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createPermissionSectionSchema rejects empty section_name", () => {
    const r = createPermissionSectionSchema.safeParse({ section_name: "" });
    expect(r.success).toBe(false);
  });

  it("updatePermissionSectionSchema validates with permission_uuid and section_name", () => {
    const r = updatePermissionSectionSchema.safeParse({
      permission_uuid: "perm-001",
      section_name: "Roles",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.permission_uuid).toBe("perm-001");
    }
  });

  it("updatePermissionSectionSchema rejects missing permission_uuid", () => {
    const r = updatePermissionSectionSchema.safeParse({
      section_name: "Roles",
    });
    expect(r.success).toBe(false);
  });

  it("updatePermissionSectionSchema rejects missing section_name", () => {
    const r = updatePermissionSectionSchema.safeParse({
      permission_uuid: "perm-001",
    });
    expect(r.success).toBe(false);
  });

  it("listPermissionSectionsOutputSchema validates array of sections", () => {
    const r = listPermissionSectionsOutputSchema.safeParse([
      {
        permission_uuid: "perm-001",
        section_name: "User Management",
        created_at: new Date("2026-06-14"),
      },
      {
        permission_uuid: "perm-002",
        section_name: "Reports",
        created_at: new Date("2026-06-15"),
      },
    ]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.length).toBe(2);
    }
  });

  it("listPermissionSectionsOutputSchema accepts nullable section_name", () => {
    const r = listPermissionSectionsOutputSchema.safeParse([
      {
        permission_uuid: "perm-001",
        section_name: null,
        created_at: new Date("2026-06-14"),
      },
    ]);
    expect(r.success).toBe(true);
  });

  it("listPermissionSectionsOutputSchema rejects missing required permission_uuid", () => {
    const r = listPermissionSectionsOutputSchema.safeParse([
      {
        section_name: "User Management",
        created_at: new Date("2026-06-14"),
      },
    ]);
    expect(r.success).toBe(false);
  });

  it("listPermissionSectionsOutputSchema rejects missing required created_at", () => {
    const r = listPermissionSectionsOutputSchema.safeParse([
      {
        permission_uuid: "perm-001",
        section_name: "User Management",
      },
    ]);
    expect(r.success).toBe(false);
  });

  it("listPermissionSectionsOutputSchema validates empty array", () => {
    const r = listPermissionSectionsOutputSchema.safeParse([]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.length).toBe(0);
    }
  });

  it("createPermissionSectionOutputSchema validates with permission_uuid", () => {
    const r = createPermissionSectionOutputSchema.safeParse({
      permission_uuid: "perm-001",
    });
    expect(r.success).toBe(true);
  });

  it("updatePermissionSectionOutputSchema validates with permission_uuid", () => {
    const r = updatePermissionSectionOutputSchema.safeParse({
      permission_uuid: "perm-001",
    });
    expect(r.success).toBe(true);
  });
});
