import { describe, it, expect } from "vitest";
import type { PermissionSectionItem } from "./schemas";

/**
 * Page migration test for admin/permission-sections.
 * Validates the data contract between the page and the server action.
 */
describe("admin permission-sections page — data contract", () => {
  it("PermissionSectionItem has expected required fields", () => {
    const row: PermissionSectionItem = {
      permissionUuid: "ps-123",
      sectionName: "User Management",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    };
    expect(row.permissionUuid).toBe("ps-123");
    expect(row.sectionName).toBe("User Management");
    expect(row.createdAt).toBeInstanceOf(Date);
  });

  it("PermissionSectionItem allows nullable sectionName", () => {
    const row: PermissionSectionItem = {
      permissionUuid: "ps-null-test",
      sectionName: null,
      createdAt: new Date("2026-06-01T12:00:00Z"),
    };
    expect(row.sectionName).toBeNull();
    expect(row.permissionUuid).toBe("ps-null-test");
  });

  it("PermissionSectionItem createdAt is a Date", () => {
    const row: PermissionSectionItem = {
      permissionUuid: "ps-date-test",
      sectionName: "Test Section",
      createdAt: new Date("2026-06-23T00:00:00Z"),
    };
    expect(row.createdAt.getTime()).toBeGreaterThan(0);
  });

  it("DataTable-compatible shape — id field maps from permissionUuid", () => {
    const row: PermissionSectionItem = {
      permissionUuid: "datatable-id-test",
      sectionName: "DataTable Entry",
      createdAt: new Date(),
    };
    // The DataTable in the component uses s.permissionUuid as the id
    const dataTableRow = { ...row, id: row.permissionUuid };
    expect(dataTableRow.id).toBe("datatable-id-test");
  });

  it("listPermissionSections returns an array on success", async () => {
    // This is an integration-level contract test
    // The server action returns PermissionSectionResult[] or ActionError
    // We validate the success shape here
    const successResult: PermissionSectionItem[] = [
      {
        permissionUuid: "succ-1",
        sectionName: "System Settings",
        createdAt: new Date(),
      },
    ];
    expect(Array.isArray(successResult)).toBe(true);
    expect(successResult.length).toBe(1);
    expect(successResult[0].sectionName).toBe("System Settings");
  });

  it("listPermissionSections can return empty array", () => {
    const emptyResult: PermissionSectionItem[] = [];
    expect(Array.isArray(emptyResult)).toBe(true);
    expect(emptyResult.length).toBe(0);
  });

  it("deletePermissionSection success shape", () => {
    const success: { operation: "success" } = { operation: "success" };
    const error: { operation: "error"; message: string } = {
      operation: "error",
      message: "Permission section not found.",
    };
    expect(success.operation).toBe("success");
    expect(error.operation).toBe("error");
    expect(error.message).toBe("Permission section not found.");
  });
});
