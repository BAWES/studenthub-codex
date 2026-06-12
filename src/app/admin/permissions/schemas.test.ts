import { describe, it, expect } from "vitest";
import {
  listPermissionSectionsOutputSchema,
  getPermissionSectionOutputSchema,
  createPermissionSectionOutputSchema,
  updatePermissionSectionOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("listPermissionSectionsOutputSchema", () => {
  const validList = [
    {
      permission_uuid: "perm_abc123",
      section_name: "User Management",
      created_at: new Date("2026-06-15T10:00:00"),
    },
  ];

  it("accepts a valid list of permission sections", () => {
    expect(listPermissionSectionsOutputSchema.safeParse(validList).success).toBe(
      true,
    );
  });

  it("accepts null section_name", () => {
    expect(
      listPermissionSectionsOutputSchema.safeParse([
        {
          permission_uuid: "perm_abc123",
          section_name: null,
          created_at: new Date("2026-06-15T10:00:00"),
        },
      ]).success,
    ).toBe(true);
  });

  it("accepts empty array", () => {
    expect(listPermissionSectionsOutputSchema.safeParse([]).success).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    expect(
      listPermissionSectionsOutputSchema.safeParse([
        {
          section_name: "User Management",
          created_at: new Date("2026-06-15T10:00:00"),
        },
      ]).success,
    ).toBe(false);
  });

  it("rejects invalid created_at type", () => {
    expect(
      listPermissionSectionsOutputSchema.safeParse([
        {
          permission_uuid: "perm_abc123",
          section_name: "User Management",
          created_at: "2026-06-15T10:00:00",
        },
      ]).success,
    ).toBe(false);
  });
});

describe("getPermissionSectionOutputSchema", () => {
  const validSection = {
    permission_uuid: "perm_abc123",
    section_name: "User Management",
    created_at: new Date("2026-06-15T10:00:00"),
  };

  it("accepts a valid permission section", () => {
    expect(getPermissionSectionOutputSchema.safeParse(validSection).success).toBe(
      true,
    );
  });

  it("accepts null (no section found)", () => {
    expect(getPermissionSectionOutputSchema.safeParse(null).success).toBe(true);
  });

  it("rejects invalid created_at type", () => {
    expect(
      getPermissionSectionOutputSchema.safeParse({
        ...validSection,
        created_at: "2026-06-15T10:00:00",
      }).success,
    ).toBe(false);
  });

  it("rejects missing permission_uuid", () => {
    const { permission_uuid: _, ...rest } = validSection;
    expect(getPermissionSectionOutputSchema.safeParse(rest).success).toBe(
      false,
    );
  });
});

describe("createPermissionSectionOutputSchema", () => {
  it("accepts a valid UUID response", () => {
    expect(
      createPermissionSectionOutputSchema.safeParse({
        permission_uuid: "perm_abc123",
      }).success,
    ).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    expect(createPermissionSectionOutputSchema.safeParse({}).success).toBe(
      false,
    );
  });

  it("rejects empty UUID", () => {
    expect(
      createPermissionSectionOutputSchema.safeParse({
        permission_uuid: "",
      }).success,
    ).toBe(false);
  });
});

describe("updatePermissionSectionOutputSchema", () => {
  it("accepts a valid UUID response", () => {
    expect(
      updatePermissionSectionOutputSchema.safeParse({
        permission_uuid: "perm_abc123",
      }).success,
    ).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    expect(updatePermissionSectionOutputSchema.safeParse({}).success).toBe(
      false,
    );
  });
});
