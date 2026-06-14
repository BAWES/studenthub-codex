import { describe, it, expect } from "vitest";
import {
  listPermissionSectionsSchema,
  getPermissionSectionSchema,
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
  listPermissionSectionsOutputSchema,
  getPermissionSectionOutputSchema,
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
  it("listPermissionSectionsSchema accepts empty input", () => {
    const r = listPermissionSectionsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("getPermissionSectionSchema validates permission_uuid", () => {
    const r = getPermissionSectionSchema.safeParse({
      permission_uuid: "uuid-123",
    });
    expect(r.success).toBe(true);
  });

  it("getPermissionSectionSchema rejects missing uuid", () => {
    const r = getPermissionSectionSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createPermissionSectionSchema validates with section_name", () => {
    const r = createPermissionSectionSchema.safeParse({
      section_name: "HR Dashboard",
    });
    expect(r.success).toBe(true);
  });

  it("createPermissionSectionSchema rejects missing name", () => {
    const r = createPermissionSectionSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updatePermissionSectionSchema validates with uuid and name", () => {
    const r = updatePermissionSectionSchema.safeParse({
      permission_uuid: "uuid-123",
      section_name: "Updated Name",
    });
    expect(r.success).toBe(true);
  });

  it("listPermissionSectionsOutputSchema validates array output", () => {
    const r = listPermissionSectionsOutputSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("createPermissionSectionOutputSchema validates UUID output", () => {
    const r = createPermissionSectionOutputSchema.safeParse({
      permission_uuid: "new-uuid",
    });
    expect(r.success).toBe(true);
  });

  it("updatePermissionSectionOutputSchema validates UUID output", () => {
    const r = updatePermissionSectionOutputSchema.safeParse({
      permission_uuid: "updated-uuid",
    });
    expect(r.success).toBe(true);
  });
});
